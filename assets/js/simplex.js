import { reduceMotion } from "./prefs.js";

// The belief simplex. A point in the triangle is read as a possibility
// distribution over three classes, normalised by its own maximum; the
// consonant mass assignment that follows is
//
//   m(top)      = 1 - pi2
//   m(top pair) = pi2 - pi3
//   m(Theta)    = pi3
//
// which is nested, so belief and plausibility come straight out of it: the
// leading class is believed to m(top) and plausible to 1, the second only
// plausible to m(pair) + m(Theta), the third only to m(Theta). Standing at a
// vertex is certainty, standing on an edge is a two-class set, standing at
// the centre is complete ignorance.
//
// Two modes. By default the point takes a slow tour of the simplex and the
// plate ignores the pointer entirely, so passing a cursor over it does not
// stop anything. The toggle hands the pointer over: the tour freezes where it
// stood and the reader steers the point themselves.

const finePointer = window.matchMedia("(pointer: fine)");
const ORBIT = 26; // seconds for one loop of the resting orbit
const BREATH = 41; // seconds for the confidence-to-ignorance cycle

export function initSimplex() {
  const plate = document.querySelector("[data-simplex]");
  if (!plate) return;

  const svg = plate.querySelector("svg.plate-svg");
  const vertices = Array.from(plate.querySelectorAll("[data-vertex]")).map((node) => ({
    x: Number(node.getAttribute("cx")),
    y: Number(node.getAttribute("cy")),
  }));
  const point = plate.querySelector("[data-belief-point]");
  const disc = plate.querySelector("[data-belief-disc]");
  const track = plate.querySelector("[data-mass-track]");
  if (!svg || vertices.length !== 3 || !point || !disc || !track) return;

  const toggle = plate.querySelector("[data-simplex-toggle]");
  const trackX = Number(track.getAttribute("x"));
  const trackW = Number(track.getAttribute("width"));
  const bars = ["a", "b", "c"].map((key) => ({
    bel: plate.querySelector(`[data-mass="${key}-bel"]`),
    pl: plate.querySelector(`[data-mass="${key}-pl"]`),
  }));
  const thetaBar = plate.querySelector('[data-mass="theta"]');

  let frame = 0;
  let isVisible = true;
  let steering = false;
  let pointerWeight = 0; // 0 resting tour, 1 fully following the pointer
  let pointerCoords = null;
  let held = null; // where the tour stood when the pointer took over
  let elapsed = 0;
  let lastElapsed = 0;
  let originTimestamp = null;

  const barycentric = (p) => {
    const [a, b, c] = vertices;
    const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (!denominator) return [1 / 3, 1 / 3, 1 / 3];
    let wa = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denominator;
    let wb = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denominator;
    // Clamping and renormalising projects a point outside the triangle onto it,
    // so a pointer in the margin still reads as a valid distribution.
    wa = Math.max(0, wa);
    wb = Math.max(0, wb);
    const wc = Math.max(0, 1 - wa - wb);
    const total = wa + wb + wc || 1;
    return [wa / total, wb / total, wc / total];
  };

  const toPoint = (weights) => ({
    x: weights[0] * vertices[0].x + weights[1] * vertices[1].x + weights[2] * vertices[2].x,
    y: weights[0] * vertices[0].y + weights[1] * vertices[1].y + weights[2] * vertices[2].y,
  });

  // A slow tour of the simplex: three out-of-phase sinusoids run through a
  // softmax, and the temperature itself breathes, so the tour passes through
  // near-certainty, two-class ambiguity and total ignorance in turn.
  const orbitWeights = (time) => {
    const sharpness = 2.15 * (0.5 + 0.5 * Math.cos((2 * Math.PI * time) / BREATH));
    const angle = (2 * Math.PI * time) / ORBIT;
    const raw = [0, 1, 2].map((i) => Math.exp(sharpness * Math.sin(angle + (i * 2 * Math.PI) / 3)));
    const total = raw[0] + raw[1] + raw[2];
    return raw.map((value) => value / total);
  };

  const setRect = (node, x, width) => {
    if (!node) return;
    node.setAttribute("x", x.toFixed(1));
    node.setAttribute("width", Math.max(0, width).toFixed(1));
  };

  const render = (weights) => {
    const p = toPoint(weights);
    const order = [0, 1, 2].sort((i, j) => weights[j] - weights[i]);
    const peak = weights[order[0]] || 1;
    const pi = [weights[order[0]] / peak, weights[order[1]] / peak, weights[order[2]] / peak];
    const mass = { top: 1 - pi[1], pair: pi[1] - pi[2], theta: pi[2] };

    const belief = [0, 0, 0];
    const plausibility = [0, 0, 0];
    belief[order[0]] = mass.top;
    plausibility[order[0]] = 1;
    plausibility[order[1]] = mass.pair + mass.theta;
    plausibility[order[2]] = mass.theta;

    point.setAttribute("cx", p.x.toFixed(1));
    point.setAttribute("cy", p.y.toFixed(1));
    disc.setAttribute("cx", p.x.toFixed(1));
    disc.setAttribute("cy", p.y.toFixed(1));
    disc.setAttribute("r", (9 + mass.theta * 56).toFixed(1));

    bars.forEach((bar, i) => {
      const belWidth = belief[i] * trackW;
      setRect(bar.bel, trackX, belWidth);
      setRect(bar.pl, trackX + belWidth, (plausibility[i] - belief[i]) * trackW);
    });
    setRect(thetaBar, trackX, mass.theta * trackW);
  };

  const step = (timestamp) => {
    frame = 0;
    if (typeof timestamp === "number") {
      if (originTimestamp === null) originTimestamp = timestamp - elapsed * 1000;
      elapsed = (timestamp - originTimestamp) / 1000;
    }

    // Time-based rather than per-frame, so the hand-over takes the same
    // fifth of a second at 60, 120 or 144 Hz. Under reduced motion there is
    // no hand-over to watch: the pointer simply has the point.
    const target = steering ? 1 : 0;
    if (reduceMotion.matches) {
      pointerWeight = target;
    } else {
      const dt = Math.min(0.1, Math.max(0, elapsed - lastElapsed));
      pointerWeight += (target - pointerWeight) * (1 - Math.exp(-dt / 0.11));
    }
    lastElapsed = elapsed;
    const resting = steering && held ? held : orbitWeights(elapsed);
    let weights = resting;
    if (pointerCoords && pointerWeight > 0.001) {
      const aimed = barycentric(pointerCoords);
      weights = resting.map((value, i) => value + (aimed[i] - value) * pointerWeight);
      const total = weights[0] + weights[1] + weights[2] || 1;
      weights = weights.map((value) => value / total);
    }
    render(weights);

    if (!isVisible || document.hidden) return;
    // While steering, the figure only needs a frame when something moved, so
    // the loop stops once the hand-over has settled and restarts on the next
    // pointer move.
    const settled = steering && Math.abs(1 - pointerWeight) < 0.002;
    if (settled) return;
    if (steering || !reduceMotion.matches) frame = window.requestAnimationFrame(step);
  };

  const start = () => {
    if (!frame) step();
  };

  const stop = () => {
    window.cancelAnimationFrame(frame);
    frame = 0;
    originTimestamp = null;
  };

  // Screen coordinates to viewBox coordinates, so the mapping survives any
  // width the plate is rendered at.
  const toSvg = (event) => {
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const inverse = matrix.inverse();
    return {
      x: inverse.a * event.clientX + inverse.c * event.clientY + inverse.e,
      y: inverse.b * event.clientX + inverse.d * event.clientY + inverse.f,
    };
  };

  const setSteering = (next) => {
    if (next === steering) return;
    steering = next;
    if (steering) held = orbitWeights(elapsed);
    else {
      // Pick the tour back up where the pointer left the point, rather than
      // snapping to wherever the clock happens to be.
      pointerCoords = null;
      held = null;
      originTimestamp = null;
    }
    if (steering) plate.classList.add("is-explored");
    if (toggle) toggle.setAttribute("aria-pressed", String(steering));
    start();
  };

  // The controls ship hidden, because without this file the plate is a
  // finished static figure and there is nothing to hand over.
  const cue = plate.querySelector(".plate-cue");
  if (toggle) {
    toggle.removeAttribute("hidden");
    toggle.addEventListener("click", () => setSteering(!steering));
  }
  if (cue) cue.removeAttribute("hidden");

  plate.addEventListener(
    "pointermove",
    (event) => {
      if (!steering || !finePointer.matches) return;
      const coords = toSvg(event);
      if (!coords) return;
      pointerCoords = coords;
      start();
    },
    { passive: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduceMotion.addEventListener("change", () => {
    stop();
    step();
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    observer.observe(plate);
  }

  step();
}
