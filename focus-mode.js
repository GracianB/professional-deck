/* P42 · five direct destinations, eight real chapters, reversible progressive disclosure. */
(() => {
  "use strict";
  const body = document.body;
  const deck = document.getElementById("deck");
  if (!deck) return;
  const focusIds = new Set(["inicio","sistemas","demos","experiencia","contacto"]);
  const redirects={trayectoria:"experiencia","experiencia-2":"experiencia",metodo:"sistemas",capacidades:"demos"};
  const incoming=decodeURIComponent(location.hash.slice(1));
  if(redirects[incoming])history.replaceState(null,"",location.pathname+location.search+"#"+redirects[incoming]);
  const hash = decodeURIComponent(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  let full = query.get("view")==="full" || query.get("present")==="1" ||
    (Boolean(hash) && Boolean(document.getElementById(hash)) && !focusIds.has(hash));
  const toggles = [...document.querySelectorAll("[data-deck-mode]")];
  function render() {
    body.classList.toggle("deck-focus",!full);
    body.classList.toggle("deck-full",full);
    const en = document.documentElement.lang==="en";
    for (const toggle of toggles) {
      toggle.textContent=full?(en?"QUICK VIEW":"VISTA BREVE"):(en?"FULL DETAIL":"VER TODO");
      toggle.setAttribute("aria-pressed",String(full));
      toggle.setAttribute("aria-label",full?(en?"Return to quick view":"Volver a vista breve"):(en?"Show all chapters":"Mostrar todos los capítulos"));
    }
  }
  function setFull(next,writeUrl=true) {
    full=Boolean(next);
    render();
    if (!writeUrl) return;
    const url=new URL(location.href);
    if(full)url.searchParams.set("view","full");
    else {url.searchParams.delete("view");url.hash="#inicio";}
    history.replaceState(null,"",url.pathname+url.search+url.hash);
    if(!full)document.getElementById("inicio")?.scrollIntoView({block:"start",behavior:"instant"});
  }
  window.GB_DECK_VIEW = Object.freeze({
    showAll: () => setFull(true)
  });
  toggles.forEach(toggle=>toggle.addEventListener("click",()=>setFull(!full)));
  document.addEventListener("click",event=>{
    if(full)return;
    const link=event.target.closest("[data-go],a[href^='#']");
    const target=link?.dataset.go||link?.getAttribute("href")?.slice(1);
    if(target&&!focusIds.has(target)&&document.getElementById(target))setFull(true);
  },true);
  deck.addEventListener("wheel",event=>{if(!full)event.stopImmediatePropagation();},{capture:true,passive:true});
  deck.addEventListener("touchend",event=>{if(!full)event.stopImmediatePropagation();},{capture:true,passive:true});
  document.addEventListener("keydown",event=>{
    if(full||event.ctrlKey||event.metaKey||event.altKey||document.querySelector("dialog[open]"))return;
    if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","PageDown","PageUp","Home","End"].includes(event.key))return;
    if(event.target.closest("button,a,input,textarea,select,[contenteditable]"))return;
    event.stopImmediatePropagation();
  },true);
  window.addEventListener("hashchange",()=>{
    const raw=decodeURIComponent(location.hash.slice(1));
    const id=redirects[raw]||raw;
    if(id!==raw)history.replaceState(null,"",location.pathname+location.search+"#"+id);
    if(id&&!focusIds.has(id)&&document.getElementById(id))setFull(true,false);
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  render();
})();
