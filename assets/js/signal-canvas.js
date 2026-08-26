import { reduceMotion } from "./prefs.js";

// The hero's signal field. Colours come from the stylesheet so the canvas
// follows the design tokens instead of carrying its own copy of the palette,
// and phase is driven by the frame timestamp so the speed is the same on a
// 60, 120 or 144 Hz display.
export function initSignalCanvas() {
  const canvas = document.querySelector("[data-signal-canvas]");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let elapsed = 0;
  let originTimestamp = null;
  let animationFrame = 0;
  let resizeFrame = 0;
  let isVisible = true;
  let signalRgb = "224, 122, 53";
  let gridStroke = "rgba(237, 230, 218, 0.03)";

  const readTokens = () => {
    const styles = window.getComputedStyle(document.documentElement);
    const rgb = styles.getPropertyValue("--signal-rgb").trim();
    const grid = styles.getPropertyValue("--signal-grid").trim();
    if (rgb) signalRgb = rgb.split(/[\s,]+/).filter(Boolean).join(", ");
    if (grid) gridStroke = grid;
  };

  const signalColor = (alpha) => `rgba(${signalRgb}, ${alpha})`;

  const fit = () => {
    const bounds = canvas.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    context.setTransform(density, 0, 0, density, 0, 0);
  };

  const signal = (x, index, time) => {
    const slow = Math.sin(x * (1.15 + index * 0.035) + index * 1.77 + time);
    const medium = Math.sin(x * 2.35 + index * 0.93 - time * 0.55) * 0.42;
    const fast = Math.sin(x * 5.4 + index * 1.31 + time * 0.25) * 0.12;
    return slow + medium + fast;
  };

  const canAnimate = () => isVisible && !document.hidden && !reduceMotion.matches;

  const draw = (timestamp) => {
    if (typeof timestamp === "number") {
      if (originTimestamp === null) originTimestamp = timestamp - elapsed * 1000;
      elapsed = (timestamp - originTimestamp) / 1000;
    }

    context.clearRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = gridStroke;
    for (let x = 0; x <= width; x += 112) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 112) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    // Radians per second, matching the previous per-frame step at 60 Hz.
    const time = elapsed * 0.132;
    const count = 6;
    for (let line = 0; line < count; line += 1) {
      context.beginPath();
      for (let x = -8; x <= width + 8; x += 8) {
        const normalized = (x / Math.max(width, 1)) * 6.4;
        const baseline = height * (0.4 + line * 0.05);
        const amplitude = height * (0.052 + (line % 3) * 0.016);
        const y = baseline + signal(normalized, line, time) * amplitude;
        if (x === -8) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      const focusLine = line === 2;
      context.strokeStyle = focusLine ? signalColor(0.28) : signalColor(0.03 + (line % 3) * 0.02);
      context.lineWidth = focusLine ? 1.4 : 1;
      context.stroke();
    }

    if (canAnimate()) {
      animationFrame = window.requestAnimationFrame(draw);
    } else {
      animationFrame = 0;
    }
  };

  const stop = () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    // Drop the origin but keep the elapsed phase, so a restart resumes the
    // wave where it left off instead of snapping back.
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
