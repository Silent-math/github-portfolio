const { test, expect } = require("@playwright/test");

const pages = [
  ["/", /Rodrigo Pizarro \| Data Scientist/],
  ["/index.html", /Rodrigo Pizarro \| Data Scientist/],
  ["/work.html", /Work \| Rodrigo Pizarro/],
  ["/404.html", /Page not found \| Rodrigo Pizarro/],
];

for (const [path, title] of pages) {
  test(`${path} renders without browser errors`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

// The site is served from a project path, not the user root. Getting this
// wrong is invisible in the browser and silently wrong everywhere else.
const BASE = "https://silent-math.github.io/github-portfolio/";

test("deployment metadata targets the published project path", async ({ page, request }) => {
  for (const [path, url] of [
    ["/index.html", BASE],
    ["/work.html", `${BASE}work.html`],
  ]) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", url);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", url);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute("href", url);
  }

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`<loc>${BASE}</loc>`);
  expect(sitemap).toContain(`<loc>${BASE}work.html</loc>`);
  expect(sitemap).not.toContain("github.io/</loc>");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${BASE}sitemap.xml`);
});

test("every page ships a content security policy with no inline allowance", async ({ page }) => {
  for (const path of ["/index.html", "/work.html", "/404.html"]) {
    await page.goto(path);
    const policy = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute("content");
    expect(policy).toContain("default-src 'none'");
    // The inline language bootstrap is covered by a hash, never by a blanket
    // allowance; nothing on the site needs an inline style at all.
    expect(policy).toContain("'sha256-");
    expect(policy).not.toContain("'unsafe-inline'");
    expect(policy).not.toContain("'unsafe-eval'");
  }
});

test("every plate that pans on a phone can be panned, and says so", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const [path, selectors] of [
    ["/index.html", [".project-finance .plate", ".project-thesis .plate"]],
    ["/work.html", ["#information-diffusion .plate", "#ekan-thesis .plate"]],
    ["/404.html", [".plate-compact"]],
  ]) {
    await page.goto(path);

    for (const selector of selectors) {
      const plate = page.locator(selector);
      await plate.scrollIntoViewIfNeeded();

      const cue = plate.locator(".plate-swipe");
      await expect(cue, selector).toBeVisible();
      await expect(cue, selector).toHaveCSS("opacity", "1");

      // The regression this guards: the simplex plate carried
      // `pointer-events: none` so that a stray hover could not disturb its
      // tour, which also made it untouchable, so no finger could ever pan it.
      // Content wider than the box is not enough; the box has to be hittable.
      const reachable = await plate.evaluate((node) => {
        const scroller = node.querySelector(".plate-scroll");
        const box = scroller.getBoundingClientRect();
        const hit = document.elementFromPoint(
          Math.round(box.left + box.width / 2),
          Math.round(box.top + box.height / 2),
        );
        return {
          pans: scroller.scrollWidth > scroller.clientWidth,
          hittable: hit ? scroller.contains(hit) : false,
        };
      });
      expect(reachable, selector).toEqual({ pans: true, hittable: true });

      await plate.locator(".plate-scroll").evaluate((node) => {
        node.scrollLeft = 200;
      });
      await expect(cue, selector).toHaveCSS("opacity", "0");
    }
  }
});

test("the home page follows the supplied section order", async ({ page }) => {
  await page.goto("/index.html");
  const headings = await page.locator("main h2").allTextContents();
  expect(headings).toEqual(["Work", "About", "Experience", "Education", "Other projects", "Contact"]);
  await expect(page.locator(".project")).toHaveCount(2);
  await expect(page.locator(".resume-entry")).toHaveCount(2);
  await expect(page.getByText("01 · Information diffusion in financial markets · 2026", { exact: true })).toBeVisible();
  await expect(page.getByText("02 · E-KAN thesis · UTFSM 2024", { exact: true })).toBeVisible();
});

test("required distinguishing facts are present", async ({ page }) => {
  await page.goto("/index.html");
  const body = await page.locator("body").innerText();
  for (const fact of [
    "Data Scientist · Tenpo, DS&AI team · Santiago",
    "more than one million credit card users",
    "BigQuery processing to Vertex AI training",
    "direct multi-horizon XGBoost forecasts",
    "discrete-time competing-risk models",
    "two-part probabilistic models",
    "hundreds of thousands of time series",
    "MinT is ill-conditioned or computationally impractical",
    "Thesis grade 100/100",
    "RetinaNet (Focal Loss for Dense Object Detection) implemented from scratch in PyTorch",
  ]) {
    expect(body).toContain(fact);
  }
});

test("result cards and editorial sections are absent", async ({ page }) => {
  for (const path of ["/index.html", "/work.html"]) {
    await page.goto(path);
    await expect(page.locator(".metric-list, .result-grid, .note-stats, .principles, .future-slot")).toHaveCount(0);
    const body = await page.locator("body").innerText();
    for (const phrase of [
      "0 / 20",
      "0.97 days",
      "13.3",
      "91.35%",
      "0.88 AUROC",
      "4.4×",
      "the full argument",
      "keeps the caveats",
      "what the work should prove",
      "worth showing",
      "evidence trail",
      "five-seed",
      "stored result",
      "demo runs",
      "next project goes here",
    ]) {
      expect(body.toLowerCase()).not.toContain(phrase.toLowerCase());
    }
  }
});

test("the work index lists only published projects", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.locator(".page-index li")).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Open", exact: true })).toHaveCount(0);
  await expect(page.locator("#future-work")).toHaveCount(0);
});

test("LinkedIn is configured as a real external link", async ({ page }) => {
  await page.goto("/index.html");
  const linkedIn = page.getByRole("link", { name: /LinkedIn/ });
  await expect(linkedIn).toHaveCount(2);
  for (const link of await linkedIn.all()) {
    await expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/rodrigo-pizarro-alegr%C3%ADa-38b282316/",
    );
    await expect(link).toHaveAttribute("target", "_blank");
  }
  await expect(page.locator(".link-pending")).toHaveCount(0);
});

test("primary navigation connects work and experience", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("link", { name: "Work", exact: true }).first().click();
  await expect(page).toHaveURL(/work\.html$/);
  await page.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(page).toHaveURL(/index\.html#experience$/);
  await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
});

test("desktop and mobile layouts do not overflow horizontally", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/index.html");
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.locator(".site-nav")).toBeVisible();
    await expect(page.locator("#work")).toBeVisible();
  }
});

test("reduced-motion visitors receive visible content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  await expect(page.locator(".resume-entry").first()).toBeVisible();
  await expect(page.locator(".project").first()).toBeVisible();
});

test("project illustrations react to a fine pointer without moving the cards", async ({ page }) => {
  await page.goto("/index.html");
  const visual = page.locator("[data-reactive-visual]").first();
  await visual.hover({ position: { x: 120, y: 120 } });
  await expect(visual).toHaveClass(/is-reactive/);
  await expect(visual.locator("svg")).toHaveCSS("will-change", "transform");
  await page.mouse.move(0, 0);
  await expect(visual).not.toHaveClass(/is-reactive/);
});

test("the CV button follows the selected language", async ({ page }) => {
  const cv = page.locator('a[data-i18n="action.cv"]');

  // Initial load: English is the default and the one written into the HTML.
  await page.goto("/index.html");
  await expect(cv).toHaveCount(1);
  await expect(cv).toHaveAttribute("href", "assets/docs/rodrigo-pizarro-cv-en.pdf");
  await expect(cv).toHaveAttribute("aria-label", "CV in English, PDF, opens in a new tab");
  await expect(cv).toHaveAttribute("target", "_blank");
  await expect(cv).toHaveAttribute("rel", "noopener noreferrer");

  // After switching language.
  await page.locator('[data-lang-option="es"]').click();
  await expect(cv).toHaveAttribute("href", "assets/docs/rodrigo-pizarro-cv-es.pdf");
  await expect(cv).toHaveAttribute("aria-label", "CV en español, PDF, abre en una pestaña nueva");

  // After a reload on a clean URL, so only the stored preference decides.
  await page.goto("/index.html");
  await expect(cv).toHaveAttribute("href", "assets/docs/rodrigo-pizarro-cv-es.pdf");
  await expect(cv).toHaveAttribute("aria-label", "CV en español, PDF, abre en una pestaña nueva");
});

test("both CV files are served", async ({ request }) => {
  for (const file of ["rodrigo-pizarro-cv-en.pdf", "rodrigo-pizarro-cv-es.pdf"]) {
    const response = await request.get(`/assets/docs/${file}`);
    expect(response.status(), file).toBe(200);
    expect(response.headers()["content-type"], file).toContain("pdf");
  }
});
