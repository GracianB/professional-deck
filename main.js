(() => {
  "use strict";

  const I18N = window.GB_I18N || {};
  const STORAGE_KEY = "gb-portfolio-lang";
  let lang = "es";
  let t = I18N.es || {};

  const deck = document.querySelector("#deck");
  if (!deck) return;

  document.documentElement.classList.add("js");

  const slides = [...deck.querySelectorAll(".slide")];
  const rail = document.querySelector("[data-slide-rail]");
  const railStatus = document.querySelector("[data-rail-status]");
  const railMeter = document.querySelector("[data-rail-meter]");
  const currentLabel = document.querySelector("[data-current]");
  const totalLabel = document.querySelector("[data-total]");
  const progress = document.querySelector("[data-progress]");
  const prevButton = document.querySelector("[data-prev]");
  const nextButton = document.querySelector("[data-next]");
  const menu = document.querySelector(".main-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const langGate = document.querySelector("#lang-gate");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wheelMode = window.matchMedia("(min-width: 981px) and (min-height: 620px) and (pointer: fine)");
  let activeIndex = 0;
  let wheelBusy = false;
  let wheelAccumulator = 0;
  let scrollFrame = 0;
  const counted = new WeakSet();
  let commandItems = [];
  let commandCursor = 0;

  const pad = (n) => String(n).padStart(2, "0");
  const modalOpen = () => Boolean(document.querySelector("dialog[open]")) || document.body.classList.contains("lang-pending");

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
  }

  function applyI18n() {
    t = I18N[lang] || I18N.es;
    document.documentElement.lang = t.htmlLang || lang;
    document.title = t.title || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && t.metaDescription) meta.setAttribute("content", t.metaDescription);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = getByPath(t, el.dataset.i18n);
      if (val != null) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = getByPath(t, el.dataset.i18nHtml);
      if (val != null) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const val = getByPath(t, el.dataset.i18nPlaceholder);
      if (val != null) el.setAttribute("placeholder", val);
    });

    // Valor loop: actualizar cards (formato nuevo gb-loop-card o legacy)
    const loop = document.querySelector("[data-valor-loop]");
    if (loop && t.valorLoop && t.valorLoop.length) {
      let cards = loop.querySelectorAll("article");
      if (cards.length < t.valorLoop.length) {
        loop.innerHTML = t.valorLoop.map((item, idx) => {
          const parts = String(item[0]).split("/");
          const num = (parts[0] || `0${idx + 1}`).trim();
          const label = (parts[1] || "").trim() || num;
          return `<article class="gb-loop-card${idx === t.valorLoop.length - 1 ? " is-end" : ""}">` +
            `<span class="gb-loop-num">${num}</span>` +
            `<b class="gb-loop-label">${label}</b>` +
            `<h3>${item[1]}</h3><p>${item[2]}</p></article>`;
        }).join("");
        cards = loop.querySelectorAll("article");
      }
      t.valorLoop.forEach((item, idx) => {
        const el = cards[idx];
        if (!el) return;
        const parts = String(item[0]).split("/");
        const num = el.querySelector(".gb-loop-num");
        const label = el.querySelector(".gb-loop-label");
        const span = el.querySelector("span:not(.gb-loop-num)");
        const h3 = el.querySelector("h3");
        const p = el.querySelector("p");
        if (num) num.textContent = (parts[0] || "").trim() || item[0];
        if (label) label.textContent = (parts[1] || "").trim() || "";
        else if (span) span.textContent = item[0];
        if (h3) h3.textContent = item[1];
        if (p) p.textContent = item[2];
      });
    }

    // Método operativo: rellenar si vacío, o actualizar textos si ya hay HTML estático
    const stepsHost = document.querySelector("[data-method-steps]");
    if (stepsHost && t.methodSteps && t.methodSteps.length) {
      let stepNodes = stepsHost.querySelectorAll(".gb-step");
      if (stepNodes.length < t.methodSteps.length) {
        stepsHost.innerHTML = t.methodSteps.map((s, idx) =>
          `<article class="gb-step${idx === t.methodSteps.length - 1 ? " is-final" : ""}">` +
          `<span class="gb-step-num">${s[0]}</span>` +
          `<h3>${s[1]}</h3>` +
          `<p>${s[2]}</p>` +
          `<b>${s[3]}</b>` +
          `</article>`
        ).join("");
        stepNodes = stepsHost.querySelectorAll(".gb-step");
      }
      t.methodSteps.forEach((s, idx) => {
        const el = stepNodes[idx];
        if (!el) return;
        const num = el.querySelector(".gb-step-num");
        const h3 = el.querySelector("h3");
        const p = el.querySelector("p");
        const b = el.querySelector("b");
        if (num) num.textContent = s[0];
        if (h3) h3.textContent = s[1];
        if (p) p.textContent = s[2];
        if (b) b.textContent = s[3];
      });
    }

    // Capability map: rellenar si vacío, o actualizar tarjetas estáticas
    const capsHost = document.querySelector("[data-caps-board]");
    if (capsHost && t.caps && t.caps.length) {
      let capNodes = capsHost.querySelectorAll(".gb-cap");
      if (capNodes.length < t.caps.length) {
        capsHost.innerHTML = t.caps.map((c, idx) =>
          `<article class="gb-cap${idx === t.caps.length - 1 ? " is-human" : ""}">` +
          `<header><span>${c[0]}</span><b>${c[1]}</b><strong>${c[4]}</strong></header>` +
          `<h3>${c[2]}</h3>` +
          `<p>${c[3]}</p>` +
          `<div class="gb-cap-bar"><i style="width:${c[4]}%"></i></div>` +
          `</article>`
        ).join("");
        capNodes = capsHost.querySelectorAll(".gb-cap");
      }
      t.caps.forEach((c, idx) => {
        const el = capNodes[idx];
        if (!el) return;
        const h3 = el.querySelector("h3");
        const p = el.querySelector("p");
        const key = el.querySelector("header b");
        const score = el.querySelector("header strong");
        const num = el.querySelector("header span");
        const bar = el.querySelector(".gb-cap-bar i");
        if (num) num.textContent = c[0];
        if (key) key.textContent = c[1];
        if (h3) h3.textContent = c[2];
        if (p) p.textContent = c[3];
        if (score) score.textContent = c[4];
        if (bar) bar.style.width = `${c[4]}%`;
      });
    }

    const edu = document.querySelector("[data-edu-list]");
    if (edu && t.eduItems && t.eduItems.length) {
      edu.innerHTML = t.eduItems.map((e) => `<li><b>${e[0]}</b><span>${e[1]}</span></li>`).join("");
    }

    const rec = document.querySelector("[data-recruiter-grid]");
    if (rec && t.recruiterCards) {
      rec.innerHTML = t.recruiterCards.map((c) =>
        `<article><span>${c[0]}</span><h3>${c[1]}</h3><p>${c[2]}</p></article>`
      ).join("");
    }

    // update slide titles for rail
    slides.forEach((slide) => {
      const key = slide.id;
      if (t.slides && t.slides[key]) slide.dataset.title = t.slides[key];
    });

    // rebuild rail labels
    if (rail) {
      rail.querySelectorAll("button").forEach((btn, i) => {
        const slide = slides[i];
        const title = slide?.dataset.title || slide?.id || "";
        btn.setAttribute("aria-label", `${pad(i)} · ${title}`);
        const span = btn.querySelector("span");
        const code = btn.querySelector("i");
        if (code) code.textContent = pad(i);
        if (span) span.textContent = title;
      });
    }

    // role rows (slide 09): título + resumen + periodo + empresa
    // Importante: NO pisar .gb-role-year entero (contiene índice + fechas)
    if (t.roles) {
      Object.keys(t.roles).forEach((key) => {
        const card = document.querySelector(`[data-role-card="${key}"]`);
        if (!card) return;
        const title = card.querySelector(".gb-role-title, h3");
        const summary = card.querySelector("[data-role-summary], .role-summary");
        const period = card.querySelector("[data-role-period], .gb-role-dates");
        const company = card.querySelector(".gb-role-co, header b");
        if (title) title.textContent = t.roles[key].title;
        if (summary) summary.textContent = t.roles[key].summary || (t.roles[key].copy && t.roles[key].copy[0]) || "";
        if (period && t.roles[key].period) period.textContent = t.roles[key].period;
        if (company && t.roles[key].company) company.textContent = t.roles[key].company;
      });
    }

    commandItems = slides.map((slide, index) => ({
      id: slide.id,
      title: slide.dataset.title,
      code: pad(index)
    }));

    // Solo cuando el deck ya está listo (evita errores al elegir idioma)
    if (typeof selectCity === "function") {
      try { selectCity(document.querySelector(".map-pin.active")?.dataset.city || "murcia"); } catch (_) {}
    }
    if (typeof setActive === "function" && !document.body.classList.contains("lang-pending")) {
      try { setActive(activeIndex, false); } catch (_) {}
    }
  }

  function syncLangButtons() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const active = btn.dataset.langBtn === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function setLang(next, persist = true) {
    lang = next === "en" ? "en" : "es";
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    }
    document.body.dataset.lang = lang;
    try { applyI18n(); } catch (err) { console.warn("i18n", err); }
    syncDocLinks();
    syncLangButtons();
  }

  function syncDocLinks() {
    const cv = lang === "en"
      ? "./Gracian_Baena_CV_2026_EN.pdf"
      : "./Gracian_Baena_CV_2026_ES.pdf";
    const letter = lang === "en"
      ? "./Gracian_Baena_Cover_Letter_EN.pdf"
      : "./Gracian_Baena_Carta_Presentacion_ES.pdf";
    document.querySelectorAll("[data-cv-link]").forEach((a) => {
      a.setAttribute("href", cv);
      a.setAttribute("download", "");
    });
    document.querySelectorAll("[data-letter-link]").forEach((a) => {
      a.setAttribute("href", letter);
    });
  }

  function enterApp() {
    document.body.classList.remove("lang-pending");
    if (langGate) {
      langGate.classList.add("is-done");
      langGate.setAttribute("hidden", "hidden");
      langGate.style.display = "none";
      langGate.setAttribute("aria-hidden", "true");
    }
    // Asegura que el deck se vea
    document.querySelectorAll(".deck, .os-rail, .site-header, .deck-controls, .top-progress").forEach((el) => {
      el.style.visibility = "";
      el.style.pointerEvents = "";
    });
    try {
      if (typeof setActive === "function") setActive(activeIndex, false);
      if (typeof selectCity === "function") selectCity("murcia");
    } catch (_) {}
    window.scrollTo(0, 0);
    deck?.focus?.({ preventScroll: true });
  }

  let pendingLang = null; // idioma seleccionado en el gate, pendiente de confirmar

  function updateGateSelection(next) {
    pendingLang = next === "en" ? "en" : "es";
    lang = pendingLang;
    document.body.dataset.lang = pendingLang;
    try { applyI18n(); } catch (_) {}
    syncDocLinks();
    document.querySelectorAll("[data-pick-lang]").forEach((card) => {
      const active = card.getAttribute("data-pick-lang") === pendingLang;
      card.classList.toggle("is-selected", active);
      card.setAttribute("aria-pressed", String(active));
    });
    const cont = document.querySelector("#lang-continue");
    if (cont) {
      cont.disabled = false;
      cont.classList.add("is-ready");
      cont.textContent = pendingLang === "en"
        ? (I18N.en?.gateContinue || "Continue →")
        : (I18N.es?.gateContinue || "Continuar →");
    }
    syncLangButtons();
  }

  function confirmLanguageAndEnter() {
    if (!pendingLang) return;
    setLang(pendingLang, true);
    enterApp();
    try {
      if (history.replaceState) {
        history.replaceState(null, "", `?lang=${pendingLang}${location.hash || ""}`);
      }
    } catch (_) {}
  }

  function chooseLanguage(next) {
    // Header / FAB cuando ya estás dentro del portfolio
    const chosen = next === "en" ? "en" : "es";
    setLang(chosen, true);
    enterApp();
    try {
      if (history.replaceState) {
        history.replaceState(null, "", `?lang=${chosen}${location.hash || ""}`);
      }
    } catch (_) {}
  }

  // Language gate
  const params = new URLSearchParams(window.location.search);
  if (params.get("reset") === "1") {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }
  const urlLang = params.get("lang");
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}

  document.addEventListener("click", (event) => {
    // 1) Elegir idioma (solo selecciona)
    const pick = event.target.closest("[data-pick-lang]");
    if (pick && document.body.classList.contains("lang-pending")) {
      event.preventDefault();
      event.stopPropagation();
      updateGateSelection(pick.getAttribute("data-pick-lang"));
      return;
    }
    // 2) Continuar (confirma y entra)
    const cont = event.target.closest("#lang-continue");
    if (cont && document.body.classList.contains("lang-pending")) {
      event.preventDefault();
      event.stopPropagation();
      if (!cont.disabled && pendingLang) confirmLanguageAndEnter();
      return;
    }
    // 3) ES/EN del header o FAB (ya dentro)
    const btn = event.target.closest("[data-set-lang]");
    if (btn && !document.body.classList.contains("lang-pending")) {
      event.preventDefault();
      chooseLanguage(btn.getAttribute("data-set-lang") || btn.dataset.setLang);
    }
  }, true);

  if (urlLang === "en" || urlLang === "es") {
    pendingLang = urlLang;
    setLang(urlLang, true);
    enterApp();
  } else if (saved === "en" || saved === "es") {
    pendingLang = saved;
    setLang(saved, false);
    enterApp();
  } else {
    document.body.classList.add("lang-pending");
    setLang("es", false);
    const cont = document.querySelector("#lang-continue");
    if (cont) {
      cont.disabled = true;
      cont.classList.remove("is-ready");
    }
  }

  function animateCounters(slide) {
    if (reducedMotion.matches || counted.has(slide)) return;
    const counters = slide.querySelectorAll("[data-count]");
    if (!counters.length) return;
    counted.add(slide);
    counters.forEach((el) => {
      const target = Number(el.dataset.count || 0);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 900, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function setActive(index, updateHash = true) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    activeIndex = next;
    slides.forEach((slide, position) => {
      const active = position === next;
      slide.classList.toggle("is-active", active);
      if (active) {
        slide.classList.add("has-entered");
        animateCounters(slide);
      }
    });
    rail?.querySelectorAll("button").forEach((button, position) => {
      const active = position === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "true" : "false");
    });
    const slide = slides[next];
    if (currentLabel) currentLabel.textContent = pad(next + 1);
    if (railStatus) railStatus.textContent = `${pad(next)} · ${slide.dataset.title || ""}`;
    if (progress) progress.style.transform = `scaleX(${(next + 1) / slides.length})`;
    if (railMeter) railMeter.style.transform = `scaleX(${(next + 1) / slides.length})`;
    if (prevButton) prevButton.disabled = next === 0;
    if (nextButton) nextButton.disabled = next === slides.length - 1;
    if (updateHash && history.replaceState) {
      const base = `?lang=${lang}`;
      history.replaceState(null, "", `${base}#${slide.id}`);
    }
  }

  function goTo(target, instant = false) {
    const index = typeof target === "number" ? target : slides.findIndex((s) => s.id === target);
    if (index < 0) return;
    setActive(index, true);
    slides[index].scrollIntoView({
      behavior: instant || reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    menu?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  if (totalLabel) totalLabel.textContent = pad(slides.length);
  if (rail) {
    const frag = document.createDocumentFragment();
    slides.forEach((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "os-rail-item";
      button.innerHTML = `<i>${pad(index)}</i><span>${slide.dataset.title || slide.id}</span>`;
      button.addEventListener("click", () => goTo(index));
      frag.append(button);
    });
    rail.append(frag);
  }

  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => goTo(el.dataset.go));
  });
  prevButton?.addEventListener("click", () => goTo(activeIndex - 1));
  nextButton?.addEventListener("click", () => goTo(activeIndex + 1));
  menuToggle?.addEventListener("click", () => {
    const open = !menu?.classList.contains("open");
    menu?.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  deck.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      const center = deck.scrollTop + deck.clientHeight / 2;
      let closest = 0;
      let distance = Infinity;
      slides.forEach((slide, index) => {
        const c = slide.offsetTop + slide.offsetHeight / 2;
        const d = Math.abs(center - c);
        if (d < distance) { distance = d; closest = index; }
      });
      if (closest !== activeIndex) setActive(closest);
      scrollFrame = 0;
    });
  }, { passive: true });

  deck.addEventListener("wheel", (event) => {
    if (!wheelMode.matches || modalOpen() || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    if (wheelBusy) return;
    wheelAccumulator += event.deltaY;
    if (Math.abs(wheelAccumulator) < 18) return;
    const direction = wheelAccumulator > 0 ? 1 : -1;
    wheelAccumulator = 0;
    const target = Math.max(0, Math.min(slides.length - 1, activeIndex + direction));
    if (target === activeIndex) return;
    wheelBusy = true;
    goTo(target);
    window.setTimeout(() => { wheelBusy = false; }, reducedMotion.matches ? 150 : 700);
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (document.body.classList.contains("lang-pending")) return;
    if (modalOpen() && event.key !== "Escape") return;
    const tag = event.target?.tagName?.toLowerCase();
    if (["input", "textarea", "select"].includes(tag) || event.target?.isContentEditable) return;
    const keys = {
      ArrowDown: activeIndex + 1, PageDown: activeIndex + 1, ArrowRight: activeIndex + 1,
      ArrowUp: activeIndex - 1, PageUp: activeIndex - 1, ArrowLeft: activeIndex - 1,
      Home: 0, End: slides.length - 1
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  });

  // Cities — query en cada llamada (evita TDZ si se invoca desde applyI18n al inicio)
  // Murcia primero en el panel: núcleo profesional (CS · Data · AI)
  const cityOrder = ["murcia", "gran-canaria", "madrid", "varsovia", "bergamo", "lisboa"];

  function selectCity(key) {
    const city = t.cities?.[key];
    const panel = document.querySelector("[data-city-panel]");
    if (!city || !panel) return;
    document.querySelectorAll("[data-city]").forEach((button) => {
      const active = button.dataset.city === key;
      button.classList.toggle("active", active);
      button.classList.toggle("is-active", active);
      if (button.hasAttribute("aria-pressed")) button.setAttribute("aria-pressed", String(active));
    });
    panel.classList.remove("is-swapping");
    void panel.offsetWidth;
    panel.classList.add("is-swapping");
    panel.innerHTML =
      `<header><span>${city.number} / 06</span><b>${city.place}</b></header>` +
      `<div class="gb-city-body"><p class="eyebrow">${city.eyebrow}</p><h3>${city.title}</h3><p>${city.copy}</p>` +
      `<ul class="gb-city-tags">${(city.tags || []).map((tag) => `<li>${tag}</li>`).join("")}</ul></div>` +
      `<footer class="gb-city-nav">${cityOrder.map((item, index) =>
        `<button type="button" class="${item === key ? "active" : ""}" data-city="${item}" aria-label="${item}">${pad(index + 1)}</button>`
      ).join("")}</footer>`;

    // strip under map
    const strip = document.querySelector("[data-route-strip]");
    if (strip) {
      strip.innerHTML = cityOrder.map((item) => {
        const c = t.cities?.[item];
        const on = item === key ? " is-on" : "";
        return `<button type="button" class="gb-strip-item${on}" data-city="${item}"><b>${c?.number || ""}</b><span>${(c?.place || item).split("·")[0].trim()}</span></button>`;
      }).join("");
    }
  }

  document.querySelector(".gb-route-body, .route-explorer, .gb-route")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-city]");
    if (button) selectCity(button.dataset.city);
  });

  // Roles
  const experienceDialog = document.querySelector("#experience-dialog");
  function openExperience(key) {
    const role = t.roles?.[key];
    if (!role || !experienceDialog) return;
    experienceDialog.querySelector("[data-role-period]").textContent = role.period || "";
    experienceDialog.querySelector("[data-role-company]").textContent = role.company || "";
    experienceDialog.querySelector("[data-role-title]").textContent = role.title || "";
    experienceDialog.querySelector("[data-role-meta]").textContent = role.meta || "";
    const paragraphs = Array.isArray(role.copy) ? role.copy : [role.copy || role.summary || ""];
    experienceDialog.querySelector("[data-role-copy]").innerHTML = paragraphs.filter(Boolean).map((p) => `<p>${p}</p>`).join("");
    experienceDialog.querySelector("[data-role-skills]").innerHTML = (role.skills || []).map((s) => `<li>${s}</li>`).join("");
    experienceDialog.showModal();
    document.body.classList.add("dialog-open");
  }
  // Clic en tarjeta o botón Detalle
  document.querySelectorAll("[data-role]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      openExperience(el.dataset.role);
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExperience(el.dataset.role);
      }
    });
  });

  const recruiterDialog = document.querySelector("#recruiter-dialog");
  document.querySelectorAll("[data-open-recruiter]").forEach((button) => {
    button.addEventListener("click", () => {
      recruiterDialog?.showModal();
      document.body.classList.add("dialog-open");
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("close", () => document.body.classList.toggle("dialog-open", Boolean(document.querySelector("dialog[open]"))));
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  });

  // Command palette
  const commandDialog = document.querySelector("#command-dialog");
  const commandSearch = document.querySelector("[data-command-search]");
  const commandList = document.querySelector("[data-command-list]");
  const commandCount = document.querySelector("[data-command-count]");
  commandItems = slides.map((slide, index) => ({ id: slide.id, title: slide.dataset.title, code: pad(index) }));

  function renderCommands(query = "") {
    const normalized = query.trim().toLocaleLowerCase(lang === "en" ? "en" : "es");
    const matches = commandItems.filter((item) => `${item.title} ${item.id}`.toLocaleLowerCase(lang === "en" ? "en" : "es").includes(normalized));
    commandCursor = Math.min(commandCursor, Math.max(0, matches.length - 1));
    if (commandList) {
      commandList.innerHTML = matches.map((item, index) =>
        `<button type="button" class="${index === commandCursor ? "active" : ""}" data-command-target="${item.id}"><small>${item.code}</small><span>${item.title}</span><b>${t.open || "→"}</b></button>`
      ).join("");
    }
    if (commandCount) commandCount.textContent = `${matches.length} ${t.cmdCount || ""}`;
    return matches;
  }

  function openCommand() {
    if (!commandDialog || document.body.classList.contains("lang-pending")) return;
    commandCursor = activeIndex;
    renderCommands("");
    commandDialog.showModal();
    document.body.classList.add("dialog-open");
    window.setTimeout(() => commandSearch?.focus(), 30);
  }
  document.querySelectorAll("[data-open-command]").forEach((button) => button.addEventListener("click", openCommand));
  commandSearch?.addEventListener("input", () => { commandCursor = 0; renderCommands(commandSearch.value); });
  commandList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-command-target]");
    if (!button) return;
    commandDialog.close();
    goTo(button.dataset.commandTarget);
  });
  commandSearch?.addEventListener("keydown", (event) => {
    const matches = renderCommands(commandSearch.value);
    if (!matches.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      commandCursor = (commandCursor + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      renderCommands(commandSearch.value);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      commandDialog.close();
      goTo(matches[commandCursor].id);
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (commandDialog?.open) commandDialog.close(); else openCommand();
    }
  });

  // Initial
  applyI18n();
  syncDocLinks();
  syncLangButtons();
  selectCity("murcia");
  const hashId = location.hash.replace("#", "");
  const initial = slides.findIndex((slide) => slide.id === hashId);
  setActive(initial >= 0 ? initial : 0, false);
  if (initial > 0) window.setTimeout(() => goTo(initial, true), 0);
})();