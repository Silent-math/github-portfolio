import { reduceMotion } from "./prefs.js";

// Every visible string on the site. English is also the text written into the
// HTML, so the pages read correctly with no JavaScript at all; the English
// entries here exist so the switch can go back.
//
// Keys are grouped by where they appear. `action.*` and `a11y.*` are shared
// across pages; `work.*` is the Work section on the home page and `wp.*` is the
// Work page itself.

export const LANGUAGES = ["en", "es"];
export const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "rp-lang";
const FADE_MS = 160;

const strings = {
  en: {
    "a11y.skip": "Skip to content",
    "a11y.nav": "Primary navigation",
    "a11y.brand": "Rodrigo Pizarro, home",
    "a11y.lang": "Language",
    "a11y.cv": "CV in English, PDF, opens in a new tab",
    "a11y.simplexToggle": "Play or pause the simplex tour",

    "nav.experience": "Experience",
    "nav.work": "Work",

    "action.github": "GitHub",
    "action.email": "Email",
    "action.linkedin": "LinkedIn",
    "action.cv": "CV",
    // The CV is a per-language file, so its path rides along with the strings
    // and is applied by the same data-i18n-attr pass as every other attribute.
    "action.cvHref": "assets/docs/rodrigo-pizarro-cv-en.pdf",
    "action.repository": "Repository",
    "action.visualLab": "Visual laboratory",
    "action.experimentIndex": "Experiment index",

    "hero.role":
      "Data Scientist at Tenpo (Credicorp), Santiago, Chile. Civil Mathematical Engineer, UTFSM, 2024.",
    "hero.lede":
      "I develop and deploy predictive systems for financial products, from data pipelines and model training to backtesting and monitoring. My independent work focuses on quantitative finance, computer vision, and predictive uncertainty.",

    "work.heading": "Work",
    "work.more": "Work",
    // The two cues on the site: one points at the simplex toggle, the other
    // says a plate pans on a phone.
    "plate.try": "Try it yourself!",
    "plate.swipe": "Swipe to explore",
    "work.p1.title": "01 · Information diffusion in financial markets · 2026",
    "work.p1.desc":
      "Event study on 66 US large caps across 11 GICS sectors, using daily data from 2015 to 2025 and SEC 8-K item 2.02 earnings filings.",
    "work.p1.m1": "Estimated abnormal returns around each filing with rolling factor models.",
    "work.p1.m2":
      "Tested lagged return propagation to sector peers against permutation and matched non-event nulls.",
    "work.p1.m3":
      "Estimated transfer-entropy networks between stocks with factor and common-volatility controls.",
    "work.p1.m4":
      "Fit a self-exciting daily count model for extreme moves and scored it out of sample.",
    "work.p1.m5": "Modeled the post-event return distribution and checked tail calibration.",
    "work.p1.tech": "Python, event studies, transfer entropy, Hawkes processes",

    "work.p2.title": "02 · E-KAN thesis · UTFSM 2024",
    "work.p2.desc":
      "My engineering thesis on image classification under uncertainty. The model pairs a frozen EfficientNet backbone with a Kolmogorov-Arnold transformer and a Dempster-Shafer evidential output layer.",
    "work.p2.m1":
      "Designed convolutional and Kolmogorov-Arnold architectures with evidential output layers built on belief functions.",
    "work.p2.m2":
      "Implemented Dempster-Shafer combination and the training loop in PyTorch, with unit tests over the evidential layers.",
    "work.p2.m3":
      "Applied transfer learning from a frozen EfficientNet backbone under distribution shift between source and target classes.",
    "work.p2.m4":
      "Studied predictive uncertainty and calibration against softmax and temperature-scaling baselines.",
    "work.p2.m5": "Explored set-valued outputs that allow cautious classification and abstention.",
    "work.p2.tech": "PyTorch, Kolmogorov-Arnold networks, Dempster-Shafer, calibration",

    "about.heading": "About",
    "about.intro":
      "I'm a data scientist at Tenpo, a Chilean fintech, where I work on customer lifetime value forecasting, classification, and risk models for credit card segments. I studied Civil Mathematical Engineering at Universidad Técnica Federico Santa María and my thesis was on evidential deep learning for image classification under uncertainty. At Demafront I built a forecasting SaaS in Python from scratch, including the hierarchical forecasting and reconciliation APIs that run on product trees with thousands of nodes. In my free time, I build projects in computer vision, quantitative finance, and data science.",
    "about.skills": "Skills",
    "about.skill.forecasting.label": "Forecasting and time series",
    "about.skill.forecasting.value": "MLForecast, hierarchical reconciliation, backtesting",
    "about.skill.modeling.label": "Modeling",
    "about.skill.modeling.value":
      "gradient boosting, PyTorch, uncertainty quantification, evidential and Dempster-Shafer methods",
    "about.skill.data.label": "Data",
    "about.skill.data.value": "Python, SQL, BigQuery and Dataform, pandas",
    "about.skill.llm.label": "LLM systems",
    "about.skill.llm.value": "RAG pipelines, LangChain, evaluation with Ragas and TruLens",
    "about.skill.product.label": "Product",
    "about.skill.product.value": "Next.js, TypeScript, Supabase",
    "about.awards": "Awards",
    "about.award.2024": "Thesis grade 100/100, Universidad Técnica Federico Santa María",
    "about.award.2022": "Premio al Mérito Académico, Universidad Técnica Federico Santa María",
    "about.award.2020": "Lista de Excelencia, Universidad Técnica Federico Santa María",
    "about.award.2019":
      "Bronze medal, CMAT national mathematics championship, senior individual category",

    "experience.heading": "Experience",
    "experience.tenpo.title": "Data Scientist · Tenpo, DS&AI team · Santiago",
    "experience.tenpo.b1":
      "Built an end-to-end Customer Lifetime Value forecasting pipeline for more than one million credit card users, from BigQuery processing to Vertex AI training, deployment, backtesting, and monitoring.",
    "experience.tenpo.b2":
      "Modeled six revenue and cost components with direct multi-horizon XGBoost forecasts.",
    "experience.tenpo.b3":
      "Developed discrete-time competing-risk models for delinquency and voluntary closure, validated with rolling-origin out-of-time backtests.",
    "experience.tenpo.b4":
      "Built two-part probabilistic models and portfolio credit-risk exposure estimates with horizon-specific probability calibration.",
    "experience.demafront.title": "Mathematical Modeling Engineer · Demafront",
    "experience.demafront.b1":
      "Designed and deployed a cloud-native forecasting SaaS API in Python for hundreds of thousands of time series.",
    "experience.demafront.b2":
      "Designed a scalable hierarchical reconciliation method for product trees with thousands of nodes where MinT is ill-conditioned or computationally impractical.",

    "education.heading": "Education",
    "education.copy":
      "Civil Mathematical Engineering, Universidad Técnica Federico Santa María, 2024. Thesis on CNN and Kolmogorov-Arnold network architectures with Dempster-Shafer evidential output layers for image classification under uncertainty. Thesis grade 100/100.",

    "other.heading": "Other projects",
    "other.i1":
      "Véndelo, a social commerce mobile app built with Next.js, TypeScript, Supabase, and PostgreSQL. In development.",
    "other.i2":
      "RetinaNet (Focal Loss for Dense Object Detection) implemented from scratch in PyTorch.",

    "contact.heading": "Contact",

    "wp.heading": "Work",
    "wp.intro":
      "Independent work in quantitative finance and machine learning. Each case links to the full repository.",
    "wp.index1": "Information diffusion in financial markets",
    "wp.index2": "E-KAN thesis",
    "wp.moreAbout": "More about me",

    "wp.c1.kicker": "Quantitative finance · Independent study",
    "wp.c1.title": "Information diffusion in financial markets",
    "wp.c1.summary":
      "How firm-specific information enters US large-cap equity prices, measured around timestamped SEC filings.",
    "wp.c1.fact1.label": "Universe",
    "wp.c1.fact1.value": "66 large caps across 11 GICS sectors",
    "wp.c1.fact2.label": "Data",
    "wp.c1.fact2.value": "daily market data, 2015 to 2025",
    "wp.c1.fact3.label": "Events",
    "wp.c1.fact3.value": "SEC 8-K item 2.02 filings",
    "wp.c1.steps": "Steps",
    "wp.c1.s1": "Estimated event-time abnormal returns with rolling factor models.",
    "wp.c1.s2": "Tested lagged peer propagation against permutation and matched non-event nulls.",
    "wp.c1.s3":
      "Estimated transfer-entropy networks, then applied factor and common-volatility controls.",
    "wp.c1.s4": "Scored a daily self-exciting extreme-event count model out of sample.",
    "wp.c1.s5": "Conditioned the post-event return distribution and evaluated tail calibration.",
    "wp.c1.scope": "Scope",
    "wp.c1.scopeText":
      "Daily bars place within-session price discovery outside the study's scope. Transfer entropy is used as a predictive measure. The fixed universe introduces survivorship bias.",

    "wp.c2.kicker": "Engineering thesis · UTFSM 2024",
    "wp.c2.title": "E-KAN thesis",
    "wp.c2.summary":
      "Image classification under uncertainty, using evidential output layers over a frozen EfficientNet backbone and a Kolmogorov-Arnold transformer.",
    "wp.c2.fact1.label": "Model",
    "wp.c2.fact1.value": "EfficientNet + KAN + evidential head",
    "wp.c2.fact2.label": "Evaluation",
    "wp.c2.fact2.value": "accuracy, calibration, OOD detection, selective risk",
    "wp.c2.architecture": "Architecture",
    "wp.c2.architectureText":
      "A frozen EfficientNet backbone provides the feature representation. A Kolmogorov-Arnold transformer sits on top of it, and the output layer produces Dempster-Shafer mass assignments over class subsets rather than a softmax distribution, so ignorance and conflict are represented explicitly.",
    "wp.c2.method": "Method",
    "wp.c2.m1":
      "Implemented the Dempster-Shafer combination rule and the evidential loss in PyTorch, with unit tests over the layers.",
    "wp.c2.m2":
      "Trained under distribution shift, where the source and target class distributions differ.",
    "wp.c2.m3":
      "Measured ignorance, conflict, calibration, and set-valued decisions alongside softmax and temperature-scaling baselines.",
    "wp.c2.m4": "Built a parameter-matched MLP versus KAN factorial study.",

    "nf.label": "Error 404",
    "nf.title": "Page not found",
    "nf.body": "The requested page does not exist.",
    "nf.home": "Home",
  },

  es: {
    "a11y.skip": "Ir al contenido",
    "a11y.nav": "Navegación principal",
    "a11y.brand": "Rodrigo Pizarro, inicio",
    "a11y.lang": "Idioma",
    "a11y.cv": "CV en español, PDF, abre en una pestaña nueva",
    "a11y.simplexToggle": "Reproduce o pausa el recorrido del simplex",

    "nav.experience": "Experiencia",
    "nav.work": "Proyectos",

    "action.github": "GitHub",
    "action.email": "Correo",
    "action.linkedin": "LinkedIn",
    "action.cv": "CV",
    "action.cvHref": "assets/docs/rodrigo-pizarro-cv-es.pdf",
    "action.repository": "Repositorio",
    "action.visualLab": "Laboratorio visual",
    "action.experimentIndex": "Índice de experimentos",

    "hero.role":
      "Data Scientist en Tenpo (Credicorp), Santiago, Chile. Ingeniero Civil Matemático, UTFSM, 2024.",
    "hero.lede":
      "Desarrollo y despliego sistemas predictivos para productos financieros, desde el procesamiento de datos y el entrenamiento de modelos hasta el backtesting y el monitoreo. Mi trabajo independiente se centra en finanzas cuantitativas, visión por computador e incertidumbre predictiva.",

    "work.heading": "Proyectos",
    "work.more": "Proyectos",
    "plate.try": "¡Pruébalo tú mismo!",
    "plate.swipe": "Desliza para explorar",
    "work.p1.title": "01 · Difusión de información en mercados financieros · 2026",
    "work.p1.desc":
      "Estudio de eventos sobre 66 acciones de gran capitalización de EE. UU. en 11 sectores GICS, con datos diarios de 2015 a 2025 y reportes de resultados SEC 8-K ítem 2.02.",
    "work.p1.m1":
      "Estimé retornos anormales en torno a cada reporte con modelos de factores móviles.",
    "work.p1.m2":
      "Contrasté la propagación rezagada de retornos hacia pares del sector frente a nulos de permutación y de no evento pareados.",
    "work.p1.m3":
      "Estimé redes de entropía de transferencia entre acciones con controles de factores y de volatilidad común.",
    "work.p1.m4":
      "Ajusté un modelo de conteo diario autoexcitado para movimientos extremos y lo evalué fuera de muestra.",
    "work.p1.m5":
      "Modelé la distribución de retornos posterior al evento y revisé la calibración de colas.",
    "work.p1.tech": "Python, estudios de eventos, entropía de transferencia, procesos de Hawkes",

    "work.p2.title": "02 · Tesis E-KAN · UTFSM 2024",
    "work.p2.desc":
      "Mi memoria de ingeniería sobre clasificación de imágenes bajo incertidumbre. El modelo combina un backbone EfficientNet congelado con un transformer de Kolmogorov-Arnold y una capa de salida evidencial de Dempster-Shafer.",
    "work.p2.m1":
      "Diseñé arquitecturas convolucionales y de Kolmogorov-Arnold con capas de salida evidenciales basadas en funciones de creencia.",
    "work.p2.m2":
      "Implementé la combinación de Dempster-Shafer y el bucle de entrenamiento en PyTorch, con tests unitarios sobre las capas evidenciales.",
    "work.p2.m3":
      "Apliqué transfer learning desde un backbone EfficientNet congelado bajo cambio de distribución entre las clases de origen y destino.",
    "work.p2.m4":
      "Estudié la incertidumbre predictiva y la calibración frente a baselines de softmax y temperature scaling.",
    "work.p2.m5":
      "Exploré salidas de conjunto que permiten clasificación cautelosa y abstención.",
    "work.p2.tech": "PyTorch, redes de Kolmogorov-Arnold, Dempster-Shafer, calibración",

    "about.heading": "Sobre mí",
    "about.intro":
      "Soy data scientist en Tenpo, una fintech chilena, donde trabajo en forecasting de customer lifetime value, clasificación y modelos de riesgo para segmentos de tarjeta de crédito. Estudié Ingeniería Civil Matemática en la Universidad Técnica Federico Santa María y mi memoria trató sobre deep learning evidencial para clasificación de imágenes bajo incertidumbre. En Demafront construí desde cero un SaaS de forecasting en Python, incluidas las APIs de forecasting jerárquico y reconciliación que operan sobre árboles de productos con miles de nodos. En mi tiempo libre desarrollo proyectos de visión por computador, finanzas cuantitativas y ciencia de datos.",
    "about.skills": "Habilidades",
    "about.skill.forecasting.label": "Forecasting y series de tiempo",
    "about.skill.forecasting.value": "MLForecast, reconciliación jerárquica, backtesting",
    "about.skill.modeling.label": "Modelamiento",
    "about.skill.modeling.value":
      "gradient boosting, PyTorch, cuantificación de incertidumbre, métodos evidenciales y de Dempster-Shafer",
    "about.skill.data.label": "Datos",
    "about.skill.data.value": "Python, SQL, BigQuery y Dataform, pandas",
    "about.skill.llm.label": "Sistemas LLM",
    "about.skill.llm.value": "pipelines RAG, LangChain, evaluación con Ragas y TruLens",
    "about.skill.product.label": "Producto",
    "about.skill.product.value": "Next.js, TypeScript, Supabase",
    "about.awards": "Distinciones",
    "about.award.2024": "Nota de memoria 100/100, Universidad Técnica Federico Santa María",
    "about.award.2022": "Premio al Mérito Académico, Universidad Técnica Federico Santa María",
    "about.award.2020": "Lista de Excelencia, Universidad Técnica Federico Santa María",
    "about.award.2019":
      "Medalla de bronce, campeonato nacional de matemáticas CMAT, categoría individual superior",

    "experience.heading": "Experiencia",
    "experience.tenpo.title": "Data Scientist · Tenpo, equipo DS&AI · Santiago",
    "experience.tenpo.b1":
      "Construí un pipeline end-to-end de forecasting de Customer Lifetime Value para más de un millón de usuarios de tarjeta de crédito, desde el procesamiento en BigQuery hasta el entrenamiento en Vertex AI, el despliegue, el backtesting y el monitoreo.",
    "experience.tenpo.b2":
      "Modelé seis componentes de ingresos y costos con forecasts XGBoost directos multi-horizonte.",
    "experience.tenpo.b3":
      "Desarrollé modelos de riesgos competitivos en tiempo discreto para morosidad y cierre voluntario, validados con backtests rolling-origin fuera de tiempo.",
    "experience.tenpo.b4":
      "Construí modelos probabilísticos de dos partes y estimaciones de exposición al riesgo de crédito del portafolio, con calibración de probabilidades por horizonte.",
    "experience.demafront.title": "Ingeniero de Modelamiento Matemático · Demafront",
    "experience.demafront.b1":
      "Diseñé y desplegué una API SaaS de forecasting cloud-native en Python para cientos de miles de series de tiempo.",
    "experience.demafront.b2":
      "Diseñé un método escalable de reconciliación jerárquica para árboles de productos con miles de nodos, donde MinT resulta mal condicionado o computacionalmente inviable.",

    "education.heading": "Educación",
    "education.copy":
      "Ingeniería Civil Matemática, Universidad Técnica Federico Santa María, 2024. Memoria sobre arquitecturas de redes convolucionales y de Kolmogorov-Arnold con capas de salida evidenciales de Dempster-Shafer para clasificación de imágenes bajo incertidumbre. Nota de memoria 100/100.",

    "other.heading": "Otros proyectos",
    "other.i1":
      "Véndelo, una app móvil de social commerce construida con Next.js, TypeScript, Supabase y PostgreSQL. En desarrollo.",
    "other.i2":
      "RetinaNet (Focal Loss for Dense Object Detection) implementada desde cero en PyTorch.",

    "contact.heading": "Contacto",

    "wp.heading": "Proyectos",
    "wp.intro":
      "Trabajo independiente en finanzas cuantitativas y machine learning. Cada caso enlaza al repositorio completo.",
    "wp.index1": "Difusión de información en mercados financieros",
    "wp.index2": "Tesis E-KAN",
    "wp.moreAbout": "Más sobre mí",

    "wp.c1.kicker": "Finanzas cuantitativas · Estudio independiente",
    "wp.c1.title": "Difusión de información en mercados financieros",
    "wp.c1.summary":
      "Cómo la información específica de cada empresa entra en los precios de acciones de gran capitalización de EE. UU., medida en torno a reportes SEC con marca de tiempo.",
    "wp.c1.fact1.label": "Universo",
    "wp.c1.fact1.value": "66 acciones de gran capitalización en 11 sectores GICS",
    "wp.c1.fact2.label": "Datos",
    "wp.c1.fact2.value": "datos diarios de mercado, 2015 a 2025",
    "wp.c1.fact3.label": "Eventos",
    "wp.c1.fact3.value": "reportes SEC 8-K ítem 2.02",
    "wp.c1.steps": "Pasos",
    "wp.c1.s1":
      "Estimé retornos anormales en tiempo de evento con modelos de factores móviles.",
    "wp.c1.s2":
      "Contrasté la propagación rezagada hacia pares frente a nulos de permutación y de no evento pareados.",
    "wp.c1.s3":
      "Estimé redes de entropía de transferencia y luego apliqué controles de factores y de volatilidad común.",
    "wp.c1.s4":
      "Evalué fuera de muestra un modelo de conteo diario autoexcitado de eventos extremos.",
    "wp.c1.s5":
      "Condicioné la distribución de retornos posterior al evento y evalué la calibración de colas.",
    "wp.c1.scope": "Alcance",
    "wp.c1.scopeText":
      "Las barras diarias dejan el descubrimiento de precios intradía fuera del alcance del estudio. La entropía de transferencia se usa como medida predictiva. El universo fijo introduce sesgo de supervivencia.",

    "wp.c2.kicker": "Memoria de ingeniería · UTFSM 2024",
    "wp.c2.title": "Tesis E-KAN",
    "wp.c2.summary":
      "Clasificación de imágenes bajo incertidumbre, con capas de salida evidenciales sobre un backbone EfficientNet congelado y un transformer de Kolmogorov-Arnold.",
    "wp.c2.fact1.label": "Modelo",
    "wp.c2.fact1.value": "EfficientNet + KAN + capa evidencial",
    "wp.c2.fact2.label": "Evaluación",
    "wp.c2.fact2.value": "accuracy, calibración, detección OOD, riesgo selectivo",
    "wp.c2.architecture": "Arquitectura",
    "wp.c2.architectureText":
      "Un backbone EfficientNet congelado entrega la representación de features. Sobre él va un transformer de Kolmogorov-Arnold, y la capa de salida produce asignaciones de masa de Dempster-Shafer sobre subconjuntos de clases en lugar de una distribución softmax, de modo que la ignorancia y el conflicto quedan representados de forma explícita.",
    "wp.c2.method": "Método",
    "wp.c2.m1":
      "Implementé la regla de combinación de Dempster-Shafer y la pérdida evidencial en PyTorch, con tests unitarios sobre las capas.",
    "wp.c2.m2":
      "Entrené bajo cambio de distribución, donde las distribuciones de clases de origen y destino difieren.",
    "wp.c2.m3":
      "Medí ignorancia, conflicto, calibración y decisiones de conjunto junto a baselines de softmax y temperature scaling.",
    "wp.c2.m4": "Construí un estudio factorial MLP versus KAN con parámetros pareados.",

    "nf.label": "Error 404",
    "nf.title": "Página no encontrada",
    "nf.body": "La página solicitada no existe.",
    "nf.home": "Inicio",
  },
};

// Per-page document metadata. Keyed by <body data-page="...">.
const documentMeta = {
  home: {
    en: {
      title: "Rodrigo Pizarro | Data Scientist",
      description:
        "Data scientist at Tenpo (Credicorp), Santiago, Chile. Civil Mathematical Engineer, UTFSM, 2024.",
      ogTitle: "Rodrigo Pizarro",
    },
    es: {
      title: "Rodrigo Pizarro | Data Scientist",
      description:
        "Data scientist en Tenpo (Credicorp), Santiago, Chile. Ingeniero Civil Matemático, UTFSM, 2024.",
      ogTitle: "Rodrigo Pizarro",
    },
  },
  work: {
    en: {
      title: "Work | Rodrigo Pizarro",
      description:
        "Independent work in quantitative finance and machine learning by Rodrigo Pizarro.",
      ogTitle: "Work | Rodrigo Pizarro",
    },
    es: {
      title: "Proyectos | Rodrigo Pizarro",
      description:
        "Trabajo independiente en finanzas cuantitativas y machine learning de Rodrigo Pizarro.",
      ogTitle: "Proyectos | Rodrigo Pizarro",
    },
  },
  notfound: {
    en: { title: "Page not found | Rodrigo Pizarro", description: "", ogTitle: "" },
    es: { title: "Página no encontrada | Rodrigo Pizarro", description: "", ogTitle: "" },
  },
};

const OG_LOCALE = { en: "en_US", es: "es_CL" };

const readStored = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const writeStored = (lang) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    /* private mode, storage disabled: the choice just does not persist */
  }
};

export const resolveLanguage = () => {
  const fromQuery = new URLSearchParams(window.location.search).get("lang");
  if (LANGUAGES.includes(fromQuery)) return fromQuery;
  const stored = readStored();
  return LANGUAGES.includes(stored) ? stored : DEFAULT_LANGUAGE;
};

// Replaces the element's first non-blank text node, so decorative children such
// as the "↗" span survive. Falls back to textContent for plain elements.
const setText = (element, value) => {
  const node = Array.from(element.childNodes).find(
    (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== "",
  );
  if (!node) {
    if (!element.children.length) element.textContent = value;
    return;
  }
  const lead = node.textContent.match(/^\s*/)[0];
  const trail = node.textContent.match(/\s*$/)[0];
  node.textContent = lead + value + trail;
};

const setMetaContent = (selector, value) => {
  const node = document.head.querySelector(selector);
  if (node && value) node.setAttribute("content", value);
};

const applyLanguage = (lang) => {
  const table = strings[lang] || strings[DEFAULT_LANGUAGE];
  const root = document.documentElement;

  root.lang = lang;
  root.setAttribute("data-lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = table[element.dataset.i18n];
    if (typeof value === "string") setText(element, value);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attribute, key] = pair.split(":").map((part) => part.trim());
      const value = table[key];
      if (attribute && typeof value === "string") element.setAttribute(attribute, value);
    });
  });

  const page = documentMeta[document.body.dataset.page];
  if (page) {
    const meta = page[lang] || page[DEFAULT_LANGUAGE];
    document.title = meta.title;
    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[property="og:description"]', meta.description);
    setMetaContent('meta[property="og:title"]', meta.ogTitle);
  }
  setMetaContent('meta[property="og:locale"]', OG_LOCALE[lang]);

  // Canonical and og:url carry the language so a shared link opens translated.
  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical) {
    const base = canonical.getAttribute("data-base") || canonical.getAttribute("href");
    canonical.setAttribute("data-base", base);
    const href = lang === DEFAULT_LANGUAGE ? base : `${base}?lang=${lang}`;
    canonical.setAttribute("href", href);
    setMetaContent('meta[property="og:url"]', href);
  }

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.langOption === lang));
  });

  root.classList.remove("i18n-pending");
};

const rememberInUrl = (lang) => {
  const url = new URL(window.location.href);
  if (lang === DEFAULT_LANGUAGE) url.searchParams.delete("lang");
  else url.searchParams.set("lang", lang);
  window.history.replaceState(null, "", url);
};

export function initI18n() {
  let current = resolveLanguage();
  applyLanguage(current);

  const switchTo = (lang) => {
    if (!LANGUAGES.includes(lang) || lang === current) return;
    current = lang;
    writeStored(lang);
    rememberInUrl(lang);

    if (reduceMotion.matches) {
      applyLanguage(lang);
      return;
    }

    // Dip the page, swap at the dimmest point, bring it back. Nothing is ever
    // half-translated on screen.
    document.documentElement.classList.add("lang-fade");
    window.setTimeout(() => {
      applyLanguage(lang);
      document.documentElement.classList.remove("lang-fade");
    }, FADE_MS);
  };

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => switchTo(button.dataset.langOption));
  });
}
