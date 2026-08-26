import { initI18n } from "./i18n.js";
import { initSignalCanvas } from "./signal-canvas.js";
import { initFigures } from "./figures.js";
import { initReveal } from "./reveal.js";

// Language first: it clears the pre-paint guard set by the inline bootstrap in
// <head>, so nothing else should run before the page is in the right language.
initI18n();

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

initSignalCanvas();
initFigures();
initReveal();
