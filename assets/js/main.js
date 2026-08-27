import { initI18n } from "./i18n.js";
import { initForecast } from "./forecast.js";
import { initFigures } from "./figures.js";
import { initSimplex } from "./simplex.js";
import { initReveal } from "./reveal.js";

// Language first: it clears the pre-paint guard set by the inline bootstrap in
// <head>, so nothing else should run before the page is in the right language.
initI18n();

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

initForecast();
initFigures();
initSimplex();
initReveal();
