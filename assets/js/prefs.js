// One shared reduced-motion query, so every module reads the same signal and
// there is a single place to look when motion behaviour needs checking.
export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
