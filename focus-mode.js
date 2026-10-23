/* V1 FINAL · one stable scroll model for quick/full navigation. */
(() => {
  "use strict";
  const body=document.body;
  const deck=document.getElementById("deck");
  if (!deck) return;
  const focusIds=new Set(["inicio","sistemas","demos","experiencia","contacto"]);
  const redirects=Object.freeze({
    trayectoria:"experiencia","experiencia-2":"experiencia",metodo:"sistemas",capacidades:"demos"
  });
  const fallback=Object.freeze({modelo:"sistemas",ruta:"experiencia",formacion:"contacto"});
  const sections=[...deck.querySelectorAll(":scope > section.slide")];
  const toggles=[...document.querySelectorAll("[data-deck-mode]")];
  const currentQuery=new URLSearchParams(location.search);
  const incoming=decodeURIComponent(location.hash.slice(1));
  if(redirects[incoming])history.replaceState(null,"",location.pathname+location.search+"#"+redirects[incoming]);
  const initial=redirects[incoming]||incoming;
  let full=currentQuery.get("view")==="full" || currentQuery.get("present")==="1" ||
    (Boolean(initial)&&Boolean(document.getElementById(initial))&&!focusIds.has(initial));
  let scrollFrame=0;
  let preservedFullReading=null;
  const visible=id=>{
    const node=document.getElementById(id);
    return Boolean(node&&node.matches("section.slide")&&getComputedStyle(node).display!=="none");
  };
  function readingAnchor(){
    const bounds=deck.getBoundingClientRect();
    const line=bounds.top+Math.min(bounds.height*.42,310);
    const visibles=sections.filter(node=>getComputedStyle(node).display!=="none");
    const inside=visibles.find(node=>{
      const r=node.getBoundingClientRect();
      return r.top<=line&&r.bottom>line;
    });
    const closest=inside||visibles.reduce((best,node)=>{
      if(!best)return node;
      return Math.abs(node.getBoundingClientRect().top-line)<Math.abs(best.getBoundingClientRect().top-line)?node:best;
    },null);
    if(!closest)return {id:"inicio",ratio:0,detail:null,detailOffset:0};
    const r=closest.getBoundingClientRect();
    const ratio=Math.min(1,Math.max(0,(line-r.top)/Math.max(1,r.height)));
    const details=[...closest.querySelectorAll("details[data-career]")];
    const detail=details.find(node=>{
      const row=node.getBoundingClientRect();
      return row.top<=line&&row.bottom>line;
    });
    return {id:closest.id,ratio,detail:detail?.dataset.career||null,
      detailOffset:detail?detail.getBoundingClientRect().top-line:0};
  }
  function render(){
    body.classList.toggle("deck-focus",!full);
    body.classList.toggle("deck-full",full);
    const en=document.documentElement.lang==="en";
    for(const toggle of toggles){
      toggle.textContent=full?(en?"QUICK VIEW":"VISTA BREVE"):(en?"FULL DETAIL":"VER TODO");
      toggle.setAttribute("aria-pressed",String(full));
      toggle.setAttribute("aria-label",full?(en?"Return to quick view":"Volver a vista breve"):(en?"Show all chapters":"Mostrar todos los capítulos"));
    }
  }
  function scrollToAnchor(id,anchor){
    const section=document.getElementById(id);
    if(!section)return;
    const deckBounds=deck.getBoundingClientRect();
    const line=deckBounds.top+Math.min(deckBounds.height*.42,310);
    let delta;
    if(anchor.detail&&id===anchor.id){
      const item=section.querySelector('[data-career="'+anchor.detail+'"]');
      delta=item?(item.getBoundingClientRect().top-line-anchor.detailOffset):null;
    }
    if(delta===null||delta===undefined){
      const r=section.getBoundingClientRect();
      const ratio=id===anchor.id?anchor.ratio:0;
      delta=r.top+ratio*r.height-line;
    }
    const top=Math.max(0,deck.scrollTop+delta);
    deck.scrollTop=top;
  }
  function setFull(next,writeUrl=true,destination=null){
    const wasFull=full;
    const nextMode=Boolean(next);
    const currentReading=readingAnchor();
    // A full → brief → full cycle must restore the original detailed reading
    // landmark, not reinterpret a compressed quick-view section as a new spot.
    const anchor=!wasFull&&nextMode&&preservedFullReading?.id===currentReading.id
      ?preservedFullReading : currentReading;
    if(wasFull&&!nextMode) preservedFullReading=currentReading;
    if(nextMode||destination) preservedFullReading=null;
    const newMode=nextMode;
    const unchanged=full===newMode;
    full=newMode;
    render();
    let target=destination||anchor.id;
    if(!full&&!focusIds.has(target))target=fallback[target]||"inicio";
    if(!visible(target))target="inicio";
    if(writeUrl){
      const url=new URL(location.href);
      if(full)url.searchParams.set("view","full");
      else url.searchParams.delete("view");
      url.hash="#"+target;
      history.replaceState(null,"",url.pathname+url.search+url.hash);
    }
    if(unchanged&&destination===null)return;
    if(scrollFrame)cancelAnimationFrame(scrollFrame);
    if(destination){
      // Explicit navigation must win over any stale scroll-restoration frame.
      document.getElementById(target)?.scrollIntoView({block:"start",behavior:"instant"});
    }else{
      scrollToAnchor(target,anchor);
      scrollFrame=requestAnimationFrame(()=>{
        scrollFrame=0;
        scrollToAnchor(target,anchor);
      });
    }
  }
  window.GB_DECK_VIEW=Object.freeze({
    showAll:(targetId=null)=>setFull(true,true,targetId),
    isFull:()=>full
  });
  toggles.forEach(toggle=>toggle.addEventListener("click",()=>setFull(!full)));
  document.addEventListener("click",event=>{
    if(full)return;
    const link=event.target.closest("[data-go],a[href^='#']");
    const target=link?.dataset.go||link?.getAttribute("href")?.slice(1);
    if(target&&!focusIds.has(target)&&document.getElementById(target))
      setFull(true,true,target);
  },true);
  // Navigation is document-like, never hijacked by the old slide engine.
  deck.addEventListener("wheel",event=>event.stopImmediatePropagation(),{capture:true,passive:true});
  deck.addEventListener("touchend",event=>event.stopImmediatePropagation(),{capture:true,passive:true});
  document.addEventListener("keydown",event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||document.querySelector("dialog[open]"))return;
    if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","PageDown","PageUp","Home","End"].includes(event.key))return;
    if(event.target.closest("button,a,input,textarea,select,summary,[contenteditable]"))return;
    event.stopImmediatePropagation();
  },true);
  window.addEventListener("hashchange",()=>{
    const raw=decodeURIComponent(location.hash.slice(1));
    const id=redirects[raw]||raw;
    if(raw!==id)history.replaceState(null,"",location.pathname+location.search+"#"+id);
    if(id&&!focusIds.has(id)&&visible(id)===false&&document.getElementById(id))setFull(true,false,id);
  });
  window.addEventListener("popstate",()=>{
    const query=new URLSearchParams(location.search);
    const id=decodeURIComponent(location.hash.slice(1))||null;
    const wantsFull=query.get("view")==="full"||Boolean(id&&!focusIds.has(id)&&document.getElementById(id));
    setFull(wantsFull,false,id);
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  render();
})();
