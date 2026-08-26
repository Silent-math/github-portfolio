import { reduceMotion } from "./prefs.js";

const finePointer = window.matchMedia("(pointer: fine)");

// The project figures do three things: they tilt a little under a fine pointer,
// they animate idly in CSS, and they stop animating while off screen. The idle
// motion itself lives in assets/css/figures.css; this file only measures the
// curve for the draw animation and flips the off-screen flag.
export function initFigures() {
  const visuals = document.querySelectorAll("[data-reactive-visual]");
  if (!visuals.length) return;

  visuals.forEach((visual) => {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const reset = () => {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      visual.classList.remove("is-reactive");
      visual.style.setProperty("--tilt-x", "0deg");
      visual.style.setProperty("--tilt-y", "0deg");
      visual.style.setProperty("--pointer-x", "50%");
      visual.style.setProperty("--pointer-y", "50%");
    };

    const render = () => {
      pointerFrame = 0;
      if (reduceMotion.matches || !finePointer.matches) {
        reset();
        return;
      }

      const bounds = visual.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (pointerX - bounds.left) / bounds.width));
      const y = Math.min(1, Math.max(0, (pointerY - bounds.top) / bounds.height));
      visual.style.setProperty("--tilt-x", `${((0.5 - y) * 7).toFixed(2)}deg`);
      visual.style.setProperty("--tilt-y", `${((x - 0.5) * 7).toFixed(2)}deg`);
      visual.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
      visual.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
      visual.classList.add("is-reactive");
    };

    visual.addEventListener(
      "pointermove",
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!pointerFrame) pointerFrame = window.requestAnimationFrame(render);
      },
      { passive: true },
    );
    visual.addEventListener("pointerleave", reset);
    reduceMotion.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);

    // The draw animation needs the path length before it can run.
    visual.querySelectorAll(".chart-line").forEach((path) => {
      if (typeof path.getTotalLength !== "function") return;
      path.style.setProperty("--dash", String(Math.ceil(path.getTotalLength())));
    });
  });

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
    });
  });
  visuals.forEach((visual) => observer.observe(visual));
}
