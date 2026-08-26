# AGENT-DRIVER

Working notes for anyone (human or agent) editing this repository. This is the
only Markdown file that is kept in sync with the site; if something here
contradicts the code, the code is right and this file needs fixing.

---

## 1. What this is

A static personal site for **Rodrigo Pizarro**, data scientist at Tenpo
(Credicorp), Santiago, Chile. Published with GitHub Pages at
<https://silent-math.github.io/>.

- No build step, no framework, no runtime dependencies.
- Plain HTML, plain CSS, plain ES modules.
- `.nojekyll` is present, so GitHub Pages serves the files verbatim and does
  **not** run Jekyll. Markdown files are not rendered into pages.
- Everything under `node_modules/` is developer tooling only (a static server,
  an HTML validator, Playwright). None of it ships.

### Owner and links

| | |
| --- | --- |
| GitHub | <https://github.com/Silent-math> |
| LinkedIn | `https://www.linkedin.com/in/rodrigo-pizarro-alegr%C3%ADa-38b282316/` |
| Email | `rodrigo.pizarro12@gmail.com` |
| CV (English) | `assets/docs/rodrigo-pizarro-cv-en.pdf` |
| CV (Spanish) | `assets/docs/rodrigo-pizarro-cv-es.pdf` |

The CV PDF is the source of truth for biography, dates, and awards. Read it
before writing anything factual about experience or education.

---

## 2. Running and verifying locally

```bash
npm install
npm run dev        # http://127.0.0.1:4173, loopback only, caching disabled
npm run validate   # html-validate over the four production pages
npm test           # validate + Playwright
```

### Playwright currently cannot run in this environment

`npm test` fails at browser launch, not on assertions. The installed
`@playwright/test` wants Chromium build **1234**; only **1228** is downloaded,
and 1228 is missing `libnspr4`, `libnss3`, `libnssutil3`, `libsmime3` and
`libasound2`. Fixing it needs both:

```bash
npx playwright install chromium
sudo npx playwright install-deps chromium
```

Until then, verify behaviour by driving a real browser directly (any headless
Chromium works) and checking the things the suite checks: no horizontal
overflow at 1440 / 1280 / 390, section order, project and entry counts,
`will-change: transform` on a hovered figure, and the legacy `about.html`
redirect.

**Always run `npm run validate` before finishing.** It is fast and it catches
malformed markup that the eye misses.

---

## 3. Directory structure

```
.
├── index.html              home page
├── work.html               long-form case write-ups
├── about.html              legacy route: meta-refresh to index.html#experience
├── 404.html                GitHub Pages 404
├── robots.txt
├── sitemap.xml             both pages, with xhtml:link hreflang alternates
├── .nojekyll               disables Jekyll on GitHub Pages
├── .htmlvalidate.json      html-validate config
├── package.json            dev scripts only
├── playwright.config.js
├── AGENT-DRIVER.md         this file
├── README.md               the repo's public landing page on GitHub
├── assets/
│   ├── css/                seven files, linked in cascade order (see §6)
│   ├── js/                 ES modules, entry point is main.js (see §7)
│   ├── img/favicon.svg
│   └── docs/rodrigo-pizarro-cv-{en,es}.pdf
├── design-exports/         dead weight, kept for reference only, git-ignored
│   ├── *.dc.html           design-tool exports, not used by the site
│   ├── support.js          runtime for the above, not used by the site
│   └── _ds/                an unrelated "Nocturne" design system (Inter,
│                           blurple accent). Do NOT take styling cues from it.
└── tests/portfolio.spec.js
```

The four HTML files stay at the repository root because GitHub Pages routes
from there. Everything else is free to move.

---

## 4. Design system

Every value lives in `assets/css/tokens.css`. **Nothing below that file should
contain a literal colour or font-size.** There are exactly zero literal
`font-size` declarations outside `:root`; keep it that way.

### Palette

Warm near-black ground, warm off-white ink, one burnt-amber accent. This is the
identity: do not introduce a second accent hue, a lighter theme, or a gradient.

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#0d0b09` | page ground |
| `--bg-deep` | `#080706` | footer, figure panels |
| `--surface` | `#131110` | project cards |
| `--text` | `#ede6da` | headings, emphasis (15.8:1) |
| `--text-2` | `#c3b9aa` | body copy (10.2:1) |
| `--muted` | `#9a9083` | labels (6.3:1) |
| `--subtle` | `#837a6c` | meta, counters (4.6:1) |
| `--rule` | `rgba(237,230,218,0.11)` | every hairline |
| `--rule-strong` | `rgba(237,230,218,0.2)` | borders on controls |
| `--accent` | `#e07a35` | links, primary button, chart line (6.6:1) |
| `--accent-soft` | `#f0a568` | hover and secondary accent (9.6:1) |
| `--on-accent` | `#150e08` | text on the accent fill (6.4:1) |
| `--sand` `--copper` | `#cbb492` `#c2532a` | second and third series in the thesis figure |

All contrast ratios above are against `--bg` and all pass WCAG AA. If you change
a colour, recompute.

### Type

Three faces, requested in one Google Fonts call:

- **Fraunces** (variable, `opsz 9..144`, `wght 400..600`) for headings only.
- **DM Sans** (variable, `opsz 9..40`, `wght 400..600`) for everything read at
  length, plus buttons and nav.
- **DM Mono** (400) for exactly one thing: the footer copyright line. If that
  line ever stops using it, drop the family from the font request.

Five sizes, two line heights. Nothing else:

| Token | Value | Used by |
| --- | --- | --- |
| `--fs-h1` | `clamp(2rem, 4vw, 2.75rem)` | page titles |
| `--fs-h2` | `clamp(1.5rem, 2.5vw, 1.875rem)` | section headings |
| `--fs-h3` | `clamp(1.125rem, 1.6vw, 1.375rem)` | card and entry titles, ledes |
| `--fs-body` | `1.0625rem` (17px) | all running text |
| `--fs-small` | `0.9375rem` (15px) | kickers, meta, tags, footer, language switch |
| `--lh-body` | `1.6` | body |
| `--lh-heading` | `1.2` | headings |

### Measure

`--measure: 34em`, `--measure-lede: 26em`. These are **em, not ch**, on purpose:
DM Sans has an unusually wide zero, so `66ch` measured out at roughly 90
characters. At 0.49em average character width, `34em` lands near 69 characters.
Every prose block on the site currently measures 51 to 74 characters per line.

### Spacing

One section scale: `--space-section: clamp(48px, 5.5vw, 80px)`, used by every
section, the hero, the page hero, the work cases and Contact. `--shell: 1100px`,
`--gutter: 56px` (tightening to 36 / 28 / 20 at the phone breakpoints).
`--radius: 2px` everywhere. There are no other radii and no shadows at all.

---

## 5. Invariants

Break these only with an explicit instruction.

1. **No shadows, no blur, no glassmorphism.** `box-shadow` count is 0,
   `backdrop-filter` count is 0. There is exactly **one** gradient on the whole
   site: the hero bottom fade in `layout.css`, which stops the canvas meeting
   the section rule on a hard edge.
2. **No pill radii.** `border-radius: 999px` was removed; `--radius` is 2px.
3. **One accent.** Orange is for links, the primary button, list ordinals, the
   hero rule and the chart line. Kickers and field labels are `--muted`, not
   accent.
4. **No emoji, no decorative icons next to headings.** The only glyphs are `↗`
   on external links and `→` on forward links.
5. **Running text is justified with hyphenation** and falls back to ragged left
   below 600px. The selector list lives at the top of `base.css`. Ledes,
   headings, kickers, buttons, links and the Contact block stay ragged. The
   `.technology-line` is explicitly excluded.
6. **English is the text in the HTML.** With JavaScript disabled the site reads
   correctly in English. See §8.
7. **Content is never hidden by default.** Reveal classes are added by
   JavaScript, never written into the markup.

---

## 6. CSS architecture

Seven files, linked from every page **in this order**. The order is the cascade;
do not shuffle it.

| File | Contains |
| --- | --- |
| `tokens.css` | `:root` only |
| `base.css` | reset, element defaults, the type rules, justification list, focus ring, skip link, `.shell`, `scroll-margin-top`, the i18n paint guard |
| `components.css` | buttons, `.text-link`, the language switch |
| `layout.css` | nav, hero, sections, About, project cards, Contact, footer, Work page, 404 |
| `figures.css` | the two SVG figures and all of their animations |
| `responsive.css` | every media query except `prefers-reduced-motion` |
| `motion.css` | the section reveal, then the `prefers-reduced-motion` block |

`motion.css` is last so its reduced-motion overrides win. `responsive.css`
breakpoints run widest to narrowest: **960, 720, 600, 560, 460, 360**.

- **960** — two-column grids collapse; project cards stack.
- **720** — gutter 36px; nav compaction; section grids collapse to one column.
- **600** — justification off (below ~45 characters it breaks badly).
- **560** — the header wraps to two rows. Five items (wordmark, three links, the
  language switch) stop fitting on one row here, and Spanish runs longer than
  English.
- **460** — gutter 28px; the GitHub nav item drops its outlined chip.
- **360** — gutter 20px; the `↗` in the nav is hidden.

---

## 7. JavaScript architecture

ES modules, no bundler. `main.js` is the only script tag (`type="module"`, so it
is deferred automatically).

| Module | Responsibility |
| --- | --- |
| `main.js` | entry point; calls i18n first, then the year stamp, canvas, figures, reveal |
| `prefs.js` | the single shared `prefers-reduced-motion` MediaQueryList |
| `i18n.js` | the string tables and the whole language mechanism (§8) |
| `signal-canvas.js` | the hero's animated signal field |
| `figures.js` | pointer tilt, curve measurement, off-screen pause |
| `reveal.js` | the scroll reveal with its stagger and safety sweep |

Every page also carries a small **inline** script in `<head>`. It is the only
inline script and it must stay inline: it runs before the body paints. See §8.

---

## 8. Internationalisation

English and Spanish, switched client-side. Default is English.

### How a string gets translated

1. Write the English text into the HTML as normal.
2. Add `data-i18n="some.key"` to the element.
3. Add the same key to **both** `en` and `es` in `strings` inside
   `assets/js/i18n.js`.

For attributes, use `data-i18n-attr="aria-label:a11y.brand"` (semicolon-separate
multiple pairs).

`setText()` replaces the element's **first non-blank text node**, not its
`textContent`. That is deliberate: it lets `<a>Repository <span
aria-hidden="true">↗</span></a>` be translated without destroying the decorative
span. Leading and trailing whitespace on that node is preserved.

Document metadata (`<title>`, description, `og:title`, `og:description`,
`og:locale`, canonical, `og:url`) is keyed off `<body data-page="home|work|notfound">`
and lives in `documentMeta`.

### The no-flicker mechanism

This is the part that is easy to break.

- The inline `<head>` script resolves the language from `?lang=` then
  `localStorage["rp-lang"]`, sets `<html lang>` and `data-lang`, and — **only if
  the language is not English** — adds `html.i18n-pending`.
- `base.css` hides the body while that class is present.
- `i18n.js` removes the class at the end of `applyLanguage()`.
- The inline script also removes it after **900 ms** regardless. That timer is
  the failsafe: if the module never loads, the page still appears.

So: English visitors see no delay at all and no swap. Spanish visitors see the
background for a few milliseconds instead of a flash of English.

### Switching at runtime

`switchTo()` adds `html.lang-fade` (body drops to 0.4 opacity over 180 ms),
swaps at the dimmest point after 160 ms, then removes the class. Under
`prefers-reduced-motion` the swap is immediate with no dip. The URL is updated
with `history.replaceState` so a shared link opens in the right language, and
`?lang=en` is removed rather than written.

### hreflang

Each page declares `en`, `es` and `x-default` alternates. Spanish URLs are the
same path with `?lang=es`. `sitemap.xml` mirrors this with `xhtml:link`
elements. If a page is ever added, add its alternates in both places.

### Translation rules

Translate naturally, not literally. Keep technical terms accurate: leave
`backtesting`, `forecasting`, `transfer learning`, `gradient boosting`,
`softmax`, `temperature scaling`, `Dempster-Shafer`, `Kolmogorov-Arnold` and
library names in English inside Spanish sentences, because that is how they are
used professionally in Chile. Institution names and award names stay in Spanish
in **both** languages ("Premio al Mérito Académico", "Lista de Excelencia").

---

## 9. Motion

All motion respects `prefers-reduced-motion`. Under it: the reveal never
initialises, the figures hold their finished frame, the canvas stops, and the
language swap is instant.

| Thing | Timing | Notes |
| --- | --- | --- |
| Hero canvas | continuous | timestamp-driven, so speed is identical at 60/120/144 Hz; paused off-screen and when the tab is hidden |
| Figure 01, curve | 5 s loop | 1.5 s hold, 400 ms fade out, instant reset while invisible, 3 s draw |
| Figure 01, marker | 3.4 s | opacity pulse |
| Figure 02, evidence points | 3.2 s / 3.6 s | `cubic-bezier(0.2, 0.8, 0.2, 1)`, ±13 viewBox units, desynchronised by negative delays |
| Figure 02, belief regions | 3.2 s | same easing, scale to 1.03, 1.6 s out of phase |
| Figure 02, conflict ring | 9 s linear | dash march |
| Pointer tilt | 220 ms | scaled to 0.3 of what `figures.js` reports |
| Section reveal | 500 ms ease-out | opacity and 16px rise, 70 ms stagger, once |

Two subtleties that were bugs and must not be reintroduced:

1. **The curve's idle frame is the finished curve.** The keyframes start and end
   at `stroke-dashoffset: 0`. An earlier version rested on the undrawn frame, so
   a paused figure showed an empty panel.
2. **The reveal transition lives on `.is-revealed .reveal-item`, not on
   `.reveal-item`.** Putting it on the hidden class animated content *out* on
   load.

The reveal is triggered by `rootMargin: "0px 0px -15% 0px"` rather than
`threshold: 0.15`, because a section taller than `viewport ÷ 0.15` can never
reach that ratio and would stay invisible forever. A scroll-driven safety sweep
runs behind the observer and unhooks itself once everything is revealed.

---

## 10. Copy rules

- **Do not rewrite existing project copy** without being asked.
- Prefer specific nouns and active verbs. Short, factual sentences.
- Ordinary punctuation. **No em dashes.** No emoji.
- Describe what was built, modelled, tested or evaluated. Do not claim a finding
  was proved.
- No editorial adjectives, rhetorical questions, testimonials, skill-level bars,
  or invented facts.
- No marketing filler, no "passionate about", no taglines.
- The thesis is described as **original work** — what was designed, implemented
  and studied. Language about fixing, repairing, rebuilding or reconstructing
  was deliberately removed and must not come back.
- Laureate is not mentioned anywhere on the site. Freelance work is described as
  "in my free time, I build projects in computer vision, quantitative finance,
  and data science."

---

## 11. State of the site

Section order on the home page:

**hero → Work → About → Experience → Education → Other projects → Contact**

- The hero action row carries GitHub, Email, LinkedIn and CV. The Contact block
  carries Email, GitHub and LinkedIn — no CV, on purpose, it would duplicate.
- The Work section holds two projects: *Information diffusion in financial
  markets* (2026) and *E-KAN thesis* (UTFSM 2024). `work.html` holds the long
  version of both.
- About is two bands: a lede band with the heading in the narrow rail, then a
  full-width band with Skills and Awards side by side.
- Awards come from the CV's *Premios y Distinciones* section.

### Things deliberately not done

- `README.md` was kept. It is the repository's public landing page on GitHub,
  not agent scaffolding. It still contains emoji and em dashes; the no-emoji and
  no-em-dash rules apply to the **site**, not to it.
- The `design-exports/` folder is untouched dead weight, kept only because it
  was in the repository. Nothing links to it, so it is git-ignored rather than
  committed; the files stay on disk.
- `about.html` remains a bare meta-refresh redirect with no stylesheet.

### Known rough edges

- Playwright cannot run here (§2).
- Below 560px the header is two rows (75 to 82px). Above it, one row at 60 to
  64px.
- The About columns have unequal heights, so there is empty space under Awards
  at desktop widths. That is inherent to the two-column band.
- `"Forecasting and time series"` is the longest skill label and wraps in the
  narrow rail on some widths.

---

## 12. Before you finish

- [ ] `npm run validate` passes on all four pages.
- [ ] No horizontal overflow at 1440, 1280 and 390, **in both languages**.
- [ ] The language switch round-trips: EN → ES → EN restores every string, the
      URL, and `localStorage`.
- [ ] `prefers-reduced-motion` leaves everything visible and static.
- [ ] No new literal `font-size` or colour outside `tokens.css`.
- [ ] No new dependency in `package.json`.
- [ ] Every new `data-i18n` key exists in **both** language tables.
- [ ] Do not commit, stage, or push. The owner reviews the diff.
