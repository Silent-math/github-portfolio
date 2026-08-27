import { reduceMotion } from "./prefs.js";

const finePointer = window.matchMedia("(pointer: fine)");
const EPISODE_MS = 9200; // two clean pulse cycles per source

// The plates do three things: they shift a little under a fine pointer, they
// animate idly in CSS, and they stop animating while off screen. The idle
// motion itself lives in assets/css/figures.css; this file only measures the
// paths that draw themselves and flips the off-screen flag.
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
  });

  // Anything that draws or travels along itself needs its own length first.
  // The unit matters: the keyframes do arithmetic on --len.
  document.querySelectorAll("[data-measure]").forEach((path) => {
    if (typeof path.getTotalLength !== "function") return;
    path.style.setProperty("--len", `${Math.ceil(path.getTotalLength())}px`);
  });

  initSwipeCues();
  initEpisodes();

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
    });
  });
  visuals.forEach((visual) => observer.observe(visual));
}

// Below the breakpoint where a plate pans, it carries a cue saying so. The
// cue is retired the moment the reader actually pans, because an instruction
// they have already followed is just something else on the figure.
function initSwipeCues() {
  document.querySelectorAll(".plate-scroll").forEach((scroller) => {
    const plate = scroller.closest(".plate");
    if (!plate) return;
    scroller.addEventListener(
      "scroll",
      () => {
        if (scroller.scrollLeft > 8) plate.classList.add("is-panned");
      },
      { passive: true, once: false },
    );
  });
}

// A plate whose figure has several episodes shows one at a time. Only the
// network uses this: the network itself is fixed, but every filing is a
// different issuer's event, so the source moves between sectors. Under reduced
// motion the first episode simply stays up.
function initEpisodes() {
  const episodes = Array.from(document.querySelectorAll("[data-episode]"));
  if (episodes.length < 2 || reduceMotion.matches) return;

  const plate = episodes[0].closest(".plate");
  let index = 0;

  window.setInterval(() => {
    // Rotating a figure nobody is looking at only costs battery, and it would
    // also mean the reader arrives part-way through an episode.
    if (document.hidden) return;
    if (plate && plate.classList.contains("is-offscreen")) return;
    index = (index + 1) % episodes.length;
    episodes.forEach((episode, i) => episode.classList.toggle("is-live", i === index));
  }, EPISODE_MS);
}
