/* V20 cinematic opening. Session-once, no framework, no image assets.
   The presentation never blocks deep-links, reduced-motion users, or crawlers. */
(() => {
  "use strict";
  const ready = () => {
    const scene = document.querySelector("#pd20-cinema");
    const skip = scene?.querySelector("[data-cinema-skip]");
    const replay = document.querySelector("[data-cinema-replay]");
    if (!scene || !skip) return;
    const seenKey = "gb-professional-deck-v20-opening-seen";
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const timers = new Set();
    let playing = false;
    let savedFocus = null;

    const markSeen = () => {
      try { window.sessionStorage.setItem(seenKey, "1"); } catch (_) {}
    };
    const alreadySeen = () => {
      try { return window.sessionStorage.getItem(seenKey) === "1"; }
      catch (_) { return false; }
    };
    function cancelTimers() {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    }
    function schedule(fn, ms) {
      const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
      timers.add(id);
    }
    function end({immediate = false} = {}) {
      if (!playing) return;
      playing = false;
      cancelTimers();
      markSeen();
      scene.classList.add("is-leaving");
      const finish = () => {
        scene.classList.remove("is-active", "is-leaving", "is-phase-1", "is-phase-2", "is-phase-3");
        scene.hidden = true;
        document.body.classList.remove("cinema-playing");
        if (savedFocus?.isConnected && savedFocus !== document.body) savedFocus.focus({preventScroll:true});
        savedFocus = null;
      };
      if (immediate || reduce) finish(); else schedule(finish, 300);
    }
    function start({forced = false} = {}) {
      if (playing) return;
      if (reduce) { markSeen(); return; }
      if (!forced && (!["", "#inicio"].includes(window.location.hash) || alreadySeen())) return;
      if (document.querySelector("dialog[open]")) return;
      if (document.visibilityState === "hidden") return;
      cancelTimers();
      playing = true;
      savedFocus = forced ? document.activeElement : null;
      scene.hidden = false;
      scene.classList.remove("is-leaving", "is-phase-1", "is-phase-2", "is-phase-3");
      document.body.classList.add("cinema-playing");
      scene.classList.add("is-active");
      skip.focus({preventScroll:true});
      schedule(() => scene.classList.add("is-phase-1"), 120);
      schedule(() => scene.classList.add("is-phase-2"), 880);
      schedule(() => scene.classList.add("is-phase-3"), 1980);
      schedule(() => end(), 3650);
    }
    skip.addEventListener("click", () => end({immediate:true}));
    replay?.addEventListener("click", () => start({forced:true}));
    window.addEventListener("keydown", (e) => {
      if (playing && e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        end({immediate:true});
      }
    }, true);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && playing) end({immediate:true});
    });
    window.addEventListener("pagehide", () => {
      cancelTimers();
      if (playing) { markSeen(); playing = false; }
    });
    start();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, {once:true});
  else ready();
})();
