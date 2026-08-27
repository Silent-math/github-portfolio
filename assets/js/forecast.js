import { reduceMotion } from "./prefs.js";

// The hero plate. A fixed realised history meets a resampling forecast, and the
// resampling is the point of the figure: the past never changes, the envelope
// the futures are drawn from never moves, and the individual paths are drawn
// fresh, one after another, for as long as the page is open. Nothing here
// responds to the pointer, deliberately. It is a figure, not a control.
//
// Colours come from the stylesheet so the canvas follows the design tokens
// instead of carrying its own copy of the palette, and phase is driven by the
// frame timestamp, so speed is identical at 60, 120 or 144 Hz.

const STEPS = 200; // history samples across the full width
const PATHS = 8; // futures on screen at once
const SIGMA = 0.032; // per-step innovation
const DRIFT = 0.00055; // per-step drift
const ORIGIN = 0.52; // where the realised history stops
const SWEEP = 1.15; // seconds for one path to draw itself out
const HOLD = 2.6; // seconds it stays at full strength
const FADE = 2.2; // seconds it takes to leave
const STAGGER = 0.8; // seconds between one path starting and the next

// A small deterministic generator, so the realised history is the same curve
// on every load and on every resize.
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const normal = (rnd) => {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export function initForecast() {
  const canvas = document.querySelector("[data-forecast-canvas]");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const plate = canvas.closest("[data-forecast]") || canvas.parentElement;
  const keys = plate
    ? {
        hi: plate.querySelector('[data-forecast-key="hi"]'),
        mid: plate.querySelector('[data-forecast-key="mid"]'),
        lo: plate.querySelector('[data-forecast-key="lo"]'),
      }
    : {};

  let width = 0;
  let height = 0;
  let elapsed = 0;
  let originTimestamp = null;
  let animationFrame = 0;
  let resizeFrame = 0;
  let isVisible = true;
  let accentRgb = "224, 122, 53";
  let gridStroke = "rgba(237, 230, 218, 0.055)";

  // Mean-reverting so the realised path stays inside the strip; the forecast
  // itself is a plain random walk, which is what the envelope describes.
  const historyRnd = mulberry32(20260826);
  const history = new Float32Array(STEPS + 1);
  for (let i = 1; i <= STEPS; i += 1) {
    history[i] = history[i - 1] * 0.994 + DRIFT + SIGMA * normal(historyRnd);
  }

  const originIndex = Math.round(ORIGIN * STEPS);
  const base = history[originIndex];
  const horizon = STEPS - originIndex;

  // One sampled future, stored as deviations from the origin.
  const pathRnd = mulberry32(7717);
  const sample = () => {
    const dev = new Float32Array(horizon + 1);
    let value = 0;
    for (let i = 1; i <= horizon; i += 1) {
      value += DRIFT + SIGMA * normal(pathRnd);
      dev[i] = value;
    }
    return dev;
  };

  const LIFE = SWEEP + HOLD + FADE;
  const futures = Array.from({ length: PATHS }, (unused, index) => ({
    dev: sample(),
    // Negative births, so the first frame already shows a staggered field
    // rather than every path starting from nothing together.
    born: -index * STAGGER,
  }));

  const readTokens = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const rgb = styles.getPropertyValue("--accent-rgb").trim();
    const grid = styles.getPropertyValue("--rule-faint").trim();
    if (rgb) accentRgb = rgb.split(/[\s,]+/).filter(Boolean).join(", ");
    if (grid) gridStroke = grid;
  };

  const accent = (alpha) => `rgba(${accentRgb}, ${alpha})`;

  const fit = () => {
    const bounds = canvas.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    context.setTransform(density, 0, 0, density, 0, 0);
  };

  // Compressed enough that a three-sigma excursion still lands inside the
  // strip: a sampled path leaving the frame reads as a drawing error rather
  // than as the tail it actually is.
  const toY = (value) => height * (0.5 - value * 0.3);
  const toX = (index) => (index / STEPS) * width;

  const canAnimate = () => isVisible && !document.hidden && !reduceMotion.matches;

  const drawGrid = () => {
    context.lineWidth = 1;
    context.strokeStyle = gridStroke;
    for (let x = 0; x <= width; x += 96) {
      context.beginPath();
      context.moveTo(Math.round(x) + 0.5, 0);
      context.lineTo(Math.round(x) + 0.5, height);
      context.stroke();
    }
    [0.25, 0.5, 0.75].forEach((row) => {
      const y = Math.round(height * row) + 0.5;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    });
  };

  // One side of a +/- k-sigma envelope, walked out and back so it closes.
  const envelope = (k) => {
    context.beginPath();
    for (let i = originIndex; i <= STEPS; i += 1) {
      const h = i - originIndex;
      const y = toY(base + DRIFT * h + k * SIGMA * Math.sqrt(h));
      if (i === originIndex) context.moveTo(toX(i), y);
      else context.lineTo(toX(i), y);
    }
    for (let i = STEPS; i >= originIndex; i -= 1) {
      const h = i - originIndex;
      context.lineTo(toX(i), toY(base + DRIFT * h - k * SIGMA * Math.sqrt(h)));
    }
    context.closePath();
  };

  // Eased so a path leaves the origin quickly and settles into its far end,
  // which is also how the uncertainty it is drawn from behaves.
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const draw = (timestamp) => {
    if (typeof timestamp === "number") {
      if (originTimestamp === null) originTimestamp = timestamp - elapsed * 1000;
      elapsed = (timestamp - originTimestamp) / 1000;
    }

    context.clearRect(0, 0, width, height);
    drawGrid();

    context.fillStyle = accent(0.07);
    envelope(2);
    context.fill();
    context.fillStyle = accent(0.09);
    envelope(1);
    context.fill();

    context.lineWidth = 1;
    context.strokeStyle = accent(0.22);
    envelope(2);
    context.stroke();

    // Sampled futures. Each one sweeps out from the origin, holds, fades, and
    // is replaced by a fresh draw from the same distribution.
    context.lineJoin = "round";
    futures.forEach((future) => {
      const age = elapsed - future.born;
      if (age > LIFE) {
        future.dev = sample();
        future.born = elapsed;
        return;
      }
      if (age < 0) return;

      const reach = age < SWEEP ? easeOut(age / SWEEP) : 1;
      // The path being drawn right now is the brightest thing in the strip;
      // it settles back as it joins the others.
      const alpha =
        age < SWEEP
          ? 0.6
          : age < SWEEP + HOLD
            ? 0.6 - 0.26 * ((age - SWEEP) / HOLD)
            : 0.34 * (1 - (age - SWEEP - HOLD) / FADE);
      if (alpha <= 0.002) return;

      const last = Math.max(1, Math.round(reach * horizon));
      context.lineWidth = 1;
      context.strokeStyle = accent(alpha);
      context.beginPath();
      for (let h = 0; h <= last; h += 1) {
        const y = toY(base + future.dev[h]);
        if (h === 0) context.moveTo(toX(originIndex), y);
        else context.lineTo(toX(originIndex + h), y);
      }
      context.stroke();

      // While a path is still sweeping, its leading end is marked, so the
      // draw reads as one sample being taken rather than as a line growing.
      if (age < SWEEP) {
        context.fillStyle = accent(Math.min(1, 0.9 * (1 - age / SWEEP) + 0.25));
        context.beginPath();
        context.arc(toX(originIndex + last), toY(base + future.dev[last]), 2.2, 0, Math.PI * 2);
        context.fill();
      }
    });

    // Expected path.
    context.save();
    context.setLineDash([3, 5]);
    context.strokeStyle = accent(0.5);
    context.beginPath();
    for (let h = 0; h <= horizon; h += 1) {
      const y = toY(base + DRIFT * h);
      if (h === 0) context.moveTo(toX(originIndex), y);
      else context.lineTo(toX(originIndex + h), y);
    }
    context.stroke();
    context.restore();

    // Realised history.
    context.lineWidth = 1.75;
    context.strokeStyle = accent(0.92);
    context.beginPath();
    for (let i = 0; i <= originIndex; i += 1) {
      const y = toY(history[i]);
      if (i === 0) context.moveTo(toX(i), y);
      else context.lineTo(toX(i), y);
    }
    context.stroke();

    // The cut between the two.
    context.save();
    context.setLineDash([3, 5]);
    context.lineWidth = 1;
    context.strokeStyle = accent(0.45);
    context.beginPath();
    context.moveTo(Math.round(toX(originIndex)) + 0.5, 0);
    context.lineTo(Math.round(toX(originIndex)) + 0.5, height);
    context.stroke();
    context.restore();

    context.fillStyle = accent(1);
    context.beginPath();
    context.arc(toX(originIndex), toY(base), 3.5, 0, Math.PI * 2);
    context.fill();

    const spread = 2 * SIGMA * Math.sqrt(horizon);
    const centre = base + DRIFT * horizon;
    const place = (node, value) => {
      if (node) node.style.top = `${(toY(value) / Math.max(height, 1)) * 100}%`;
    };
    place(keys.hi, centre + spread);
    place(keys.mid, centre);
    place(keys.lo, centre - spread);

    if (canAnimate()) animationFrame = window.requestAnimationFrame(draw);
    else animationFrame = 0;
  };

  const stop = () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    // Drop the origin but keep the elapsed phase, so a restart resumes where
    // it left off instead of snapping back.
    originTimestamp = null;
  };

  const start = () => {
    if (!animationFrame) draw();
  };

  const restart = () => {
    stop();
    readTokens();
    fit();
    draw();
  };

  window.addEventListener(
    "resize",
    () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(restart);
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduceMotion.addEventListener("change", restart);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);
  }

  restart();
}
