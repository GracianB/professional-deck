/* Shared shell for four project case studies. Keep site language/theme in sync. */
(() => {
  "use strict";
  const root = document.documentElement;
  const LANG_KEY = "gb-portfolio-lang";
  const THEME_KEY = "gb-portfolio-theme";
  const params = new URLSearchParams(location.search);
  const read = (key) => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const store = (key, value) => { try { localStorage.setItem(key,value); } catch (_) {} };
  const requested = params.get("theme");
  const fromStore = read(THEME_KEY);
  let theme = ["dark","light"].includes(requested) ? requested : (["dark","light"].includes(fromStore) ? fromStore : "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
  const selectedLang = params.get("lang") === "en" || (params.get("lang") !== "es" && read(LANG_KEY) === "en") ? "en" : "es";
  root.lang = selectedLang;
  store(LANG_KEY, selectedLang);
  const schemeMeta = document.querySelector('meta[name="theme-color"]');
  const updateTheme = (next) => {
    theme = next;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    if (schemeMeta) schemeMeta.content = next === "light" ? "#eef6f8" : "#091620";
    store(THEME_KEY,next);
    document.querySelectorAll("[data-case-theme]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.caseTheme === next));
    });
  };
  updateTheme(theme);

  const init = () => {
    const header = document.querySelector(".case-header");
    const nav = header?.querySelector("nav");
    const main = document.querySelector(".case-main");
    if (!nav || !main) return;
    const util = document.createElement("div");
    util.className = "case-utilities";
    const langGroup = document.createElement("div");
    langGroup.className = "case-utility-group";
    langGroup.setAttribute("role","group");
    langGroup.setAttribute("aria-label", selectedLang === "en" ? "Language" : "Idioma");
    for (const lang of ["es","en"]) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.caseLang = lang;
      button.textContent = lang.toUpperCase();
      button.setAttribute("aria-pressed", String(selectedLang === lang));
      button.addEventListener("click", () => {
        if (lang === selectedLang) return;
        store(LANG_KEY,lang);
        const url = new URL(location.href);
        url.searchParams.set("lang",lang);
        history.replaceState(null,"",url);
        location.assign(url.href);
      });
      langGroup.append(button);
    }
    const themeGroup = document.createElement("div");
    themeGroup.className = "case-utility-group";
    themeGroup.setAttribute("role","group");
    themeGroup.setAttribute("aria-label",selectedLang === "en" ? "Appearance" : "Apariencia");
    for (const [value,label] of [["dark","☾"],["light","☀"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.caseTheme = value;
      button.setAttribute("aria-label", selectedLang === "en" ? (value === "dark" ? "Dark mode" : "Light mode") : (value === "dark" ? "Modo oscuro" : "Modo claro"));
      button.setAttribute("aria-pressed", String(theme === value));
      button.textContent = label;
      button.addEventListener("click",()=>updateTheme(value));
      themeGroup.append(button);
    }
    util.append(langGroup,themeGroup);
    nav.append(util);

    const chapters = selectedLang === "en"
      ? [["challenge","01 / CHALLENGE"],["system","02 / SYSTEM"],["response","03 / SOLUTION"],["proof","04 / PROOF"]]
      : [["challenge","01 / RETO"],["system","02 / SISTEMA"],["response","03 / RESPUESTA"],["proof","04 / PRUEBA"]];
    const localNav = document.createElement("nav");
    localNav.className = "case-local-nav";
    localNav.setAttribute("aria-label", selectedLang === "en" ? "Case chapters" : "Capítulos del caso");
    const stamp = document.createElement("span");
    stamp.textContent = selectedLang === "en" ? "CASE / CONTENT" : "CASO / CONTENIDO";
    localNav.append(stamp);
    for (const [id,title] of chapters) {
      const anchor = document.createElement("a");
      anchor.href = "#case-" + id;
      anchor.textContent = title;
      localNav.append(anchor);
    }
    main.prepend(localNav);

    const progress = document.createElement("div");
    progress.className = "case-reading-progress";
    progress.setAttribute("aria-hidden","true");
    const bar = document.createElement("span");
    progress.append(bar);
    document.body.prepend(progress);
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - innerHeight;
      const value = range > 0 ? Math.max(0,Math.min(1,scrollY/range)) : 1;
      bar.style.transform = "scaleX(" + value.toFixed(4) + ")";
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll",request,{passive:true});
    window.addEventListener("resize",request,{passive:true});
    update();
  };
  if (document.readyState !== "complete") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
