/* Progressive enhancements for the *decrypted* María portfolio.
   Semantic targeting avoids coupling to the encrypted document's build system. */
(() => {
  'use strict';
  function enhance() {
    if (!document.body || document.body.classList.contains('maria-polished')) return;
    document.body.classList.add('maria-polished');
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,[class*="title"],[class*="heading"]')];
    const heading = headings.find(el => {
      const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('es');
      return t.includes('trayectoria') && t.length < 180 && !el.querySelector('h1,h2,h3,h4');
    });
    if (!heading) return;
    heading.classList.add('maria-cv-heading');
    const section = heading.closest('section') || heading.closest('article') || heading.parentElement?.parentElement;
    if (!section) return;
    section.classList.add('maria-cv-section');
    // Only mark clearly decorative document mockups, never real embedded PDFs.
    const possiblePreview=[...section.querySelectorAll('[class*="paper"],[class*="mockup"],[class*="document"],[class*="resume-preview"],[class*="cv-preview"]')];
    const preview=possiblePreview.find(el=>!el.matches('iframe,object,embed') && !el.querySelector('iframe,object,embed'));
    if (preview) preview.setAttribute('data-maria-cv-preview','');
    const text=heading.textContent?.trim();
    if(text) heading.setAttribute('aria-label',text.replace(/\s+/g,' '));
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',enhance,{once:true});
  else enhance();
})();
