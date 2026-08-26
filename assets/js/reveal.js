import { reduceMotion } from "./prefs.js";

// A section's stagger units are its own children, except that a lone .shell
// wrapper is stepped through, and an element marked data-reveal-group hands
// over its children instead of itself.
const staggerUnits = (section) => {
  let children = Array.from(section.children);
  if (children.length === 1 && children[0].children.length > 1) {
    children = Array.from(children[0].children);
  }
  return children.flatMap((child) =>
    child.hasAttribute("data-reveal-group") ? Array.from(child.children) : [child],
  );
};

// Sections fade and rise once, the first time they come into view. The hidden
// class is added here rather than in the markup, so nothing can end up stuck
// invisible if this file fails to load.
export function initReveal() {
  if (!("IntersectionObserver" in window) || reduceMotion.matches) return;

  const sections = document.querySelectorAll(".section, .work-case, .contact-panel");
  if (!sections.length) return;

  const reveal = (section) => {
    if (section.classList.contains("is-revealed")) return;
    section.classList.add("is-revealed");
    observer.unobserve(section);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    // A section taller than the viewport can never reach a 0.15 ratio, so the
    // trigger is "the top edge has passed 85% of the viewport" instead.
    { rootMargin: "0px 0px -15% 0px" },
  );

  // Safety sweep behind the observer: if a callback is ever missed, a section
  // that has scrolled into view still comes back. It runs at most once a frame
  // and unhooks itself once every section has been revealed.
  let sweepFrame = 0;
  const sweep = () => {
    sweepFrame = 0;
    const limit = window.innerHeight * 0.85;
    let pending = 0;
    sections.forEach((section) => {
      if (section.classList.contains("is-revealed")) return;
      if (section.getBoundingClientRect().top < limit) reveal(section);
      else pending += 1;
    });
    if (!pending) window.removeEventListener("scroll", queueSweep);
  };
  const queueSweep = () => {
    if (!sweepFrame) sweepFrame = window.requestAnimationFrame(sweep);
  };

  sections.forEach((section) => {
    staggerUnits(section).forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-index", String(index));
    });
    observer.observe(section);
  });

  window.addEventListener("scroll", queueSweep, { passive: true });
  // Deferred by a frame so the hidden state paints once and the first sections
  // animate in rather than appearing already finished.
  queueSweep();
}
