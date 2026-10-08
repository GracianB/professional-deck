# Gracián Baena · Professional Deck V24

**Customer Success Systems & Data Strategist**  
Murcia, Spain · Remote · Spanish / English / Italian

[Open the deck](https://gracianb.github.io/professional-deck/) · [Professional Hub](https://gracianb.github.io/GracianB/) · [LinkedIn](https://www.linkedin.com/in/gracianbaena) · [Systems Lab](https://gracianb.github.io/systems-lab/)

---

## What this repository is

This is the **professional evidence layer** of my public portfolio.

The main hub answers:

> Who is Gracián and which world do I want to enter?

This deck answers:

> What has he done, how does he work, and where is the proof?

The final narrative is deliberately simple:

**customer → operations → data → system → adoption → outcome**

I started close to customers, teams and daily operations. The technical layer came later so I could build the missing system directly instead of stopping at recommendations.

---

## V24 · Silver / ivory / beige universe

The V23 60-second recap now anchors the palette for the **entire** profile: twelve curated slides, all common chrome and dialogues, cinematic opening, real vector Atlas and all four independent case-study HTML pages. V24 is an editorial silver-graphite-ivory identity, visually distinct from the blue Systems Lab and green Yoga.

`v24-universe.css` is the **canonical final deck palette** and loads after the historical structural CSS; responsive grid/behavior remains unchanged. The four case pages use a shared V24 block in `case-pages.css` and cache-bust their link. A warm ivory light mode is designed as a first-class theme for all chapters, not a filter over the dark theme. New browser tests capture all twelve sections in both modes and check representative calculated style values, mobile overflow and usable controls. Later GracianB umbrella-site work is explicitly outside this PR.

## V23 · 60-second briefing gets the final palette

The recruiter 60-second dialog now shares the Deck's midnight/slate and ivory editorial styling in both dark and light appearances. The old brown modal, sepia chapter controls, buttons and orbit accents are replaced by slate, ivory and restrained mineral blue. Four timed chapters, navigation, close, restart and CV links stay functional. CSS load order and browser/production tests enforce this visual contract.

## V22 · Personal editorial palette, not Systems Lab blue

The four independent case pages now combine ink navy with **warm ivory/beige** and restrained mineral accents, expressly avoiding brown/coffee. The challenge/response/evidence chapters switch to pale ivory with dark ink, while the operational system chapter remains deep slate. Light mode has a warm-neutral ivory canvas and a dark system chapter, rather than an all-blue or all-white document. Cover, content, ES/EN and interactions remain intact. Playwright tests check the intended section backgrounds and contrasting headings on desktop and mobile.

## V21 · Independent case pages receive the same design

All four standalone HTML case studies are now in the same visual family as the main deck:

- [Bodytone Support OS](./proyecto-bodytone.html), [Calculator](./proyecto-calculadora.html), [LinkedIn Finder](./proyecto-linkedin.html), [Outreach GenAI](./proyecto-outreach.html).
- All use `case-pages.css` after the existing base styles; this replaces the old hard-coded beige/cream page panels with midnight navy, blue-mineral accents and a full cool light theme. The case claims, evidence and IP boundaries remain unchanged.
- `case-ui.js` uses the same persisted `gb-portfolio-theme` and `gb-portfolio-lang` keys as the main deck, adds accessible ES/EN and light/dark switches and chapter anchors with reading progress.
- Browser tests verify all four in both themes, both languages and mobile/desktop, including theme persistence when returning to the deck.
- The 404 redirect fallback also uses navy rather than brown.

## V20 · Coherent story, light theme and cinematic opening

- Model is now a **balanced seven-step 4+3 journey** with its own outcome sentence and four linked evidence cards.
- Public evidence, Method and Education use the same slate/mineral palette as Evolution, replacing old sepia/brown cards.
- The desktop navigation is centred **on the same horizontal row** as the right-side language, theme and CV utilities. Mid-width uses the menu instead of allowing collisions.
- A final cascade layer audits all **12 chapters in light mode**, plus the rail, header, interactive atlas, dialogs and contact links.
- The opening film uses typography, gradients and CSS orbits, with skip/Escape, automatic completion, one-time session playback, reduced-motion opt-out and an explicit replay control on the cover. Deep-links bypass it.
- No video or image assets are required for the film.

## V19 · Final interactive refinements

V19 is the actual HTML/CSS/JavaScript implementation, not a generated mockup. The Bodytone case now uses the cover's midnight-navy visual language with a workflow strip (customer, Zendesk, data, Academy) and retains only grounded, previously documented metrics. The six-city atlas uses selectable markers and SVG-drawn contextual links; explore cities manually, toggle all connections or play/pause a tour. The map uses actual Natural Earth 1:110m country vector boundaries embedded in the HTML. City pins use actual coordinates. Connecting curves show context, **not measured journeys**. Natural Earth data is public domain; no raster maps or generated images are shipped. The final contact chapter now has real links, CV, agenda, languages and public project references on a bespoke dark interactive-style composition. No stock photographs, fabricated percentages or image generation assets.

## V18 chapter structure

**12 deliberate chapters**, including the requested return of Model and Capabilities. No separate generic "Differential", duplicated timeline or filler language slide.

| # | Chapter | Purpose |
|---|---|---|
| 00 | Cover | Human-first positioning |
| 01 | Model | Customer → operations → signal → decision → system → adoption → outcome |
| 02 | Bodytone | Operational proof |
| 03 | Public work | RevOps Studio, OHANA and VØRTICE |
| 04 | Method | Listen, translate, build, activate, prove |
| 05 | European atlas | Murcia, Gran Canaria, Madrid, Lisbon, Bergamo and Warsaw on a coordinate-based artistic map |
| 06 | Evolution | A unified five-stage professional narrative |
| 07 | Experience I | Bodytone, Minderest, Majorel with brand-inspired original artwork |
| 08 | Experience II | Solaris, El Corte Inglés, Primark with brand-inspired original artwork |
| 09 | Capabilities | Verifiable CS, AI, data, game/interactive and sound/graphics work |
| 10 | Education | Retained as designed |
| 11 | Contact | Working languages, CV and links |

The six map positions are latitude/longitude references on an intentionally simplified basemap. Narrative lines are *not* transport routes, and locations are *not* attributed to specific employers without evidence. The graphic marks are original stylistic illustrations, **not licensed official corporate logos**.

The **60-second overview** is now a timed experience, not a scrollable recruiter document: four 15-second chapters, playable/pausable, keyboard-accessible and translated to ES/EN. The atlas distinguishes real geographic context from the conceptual timeline, without treating every employer as a precise location. Legacy URLs with removed slide hashes open the cover instead of pointing at filler pages.

The presentation is bilingual **ES / EN**, supports dark/light themes, keyboard navigation, touch navigation, deep links, command palette and presentation mode.

---

## Public evidence

### Bodytone Support OS

The flagship professional case.

**Problem:** support knowledge, routing, visibility and adoption were fragmented.

**System:** Help Center + Zendesk routing + automation + reporting + internal enablement.

**Proof:** the public Help Center and the documented case.

- [Public Help Center](https://bodytonehelp.zendesk.com/hc/es)
- [Bodytone case](https://gracianb.github.io/professional-deck/proyecto-bodytone.html)

### RevOps Studio

A local-first decision system for Revenue Operations.

It demonstrates data quality, deterministic scoring, forecasting, segmentation, human approval and traceability.

- [Live](https://gracianb.github.io/revops-studio/)
- [Source](https://github.com/GracianB/revops-studio)

### Project OHANA

A browser game used as a systems-engineering laboratory.

It demonstrates state, fixed simulation, behavioural systems, regression, CI and browser E2E.

- [Play](https://gracianb.github.io/project-ohana/)
- [Source](https://github.com/GracianB/project-ohana)

### VØRTICE V6

A generative audiovisual WebGL experience.

It demonstrates real-time interaction, adaptive rendering, Web Audio integration, performance budgets, accessibility and Chromium E2E.

- [Experience](https://vortex-gilt-xi.vercel.app/)
- [Source](https://github.com/GracianB/vortex)

### Systems Lab

The technical world where experiments and public builds live.

- [Open Systems Lab](https://gracianb.github.io/systems-lab/)

---

## Career progression

The deck does not present the career as unrelated jobs.

It presents the layers that accumulated:

**service / retail → operations / training → B2B SaaS Customer Success → AI / data / development specialization → Customer Operations / Data**

Selected organizations shown in the professional timeline:

- Mooby
- Primark
- El Corte Inglés
- Solaris
- Majorel · Google / YouTube environment
- Minderest
- Bodytone

The 2024–2025 period is presented as a **specialization stage** in applied AI, data/development and yoga/mindfulness, not as a fabricated employer.

Yoga remains a real professional track, but it is not inserted into the professional employer timeline as if it were a Customer Success role.

---

## Operating model

The final deck uses the same working logic across business and technical cases:

```text
Understand
   ↓
Model
   ↓
Build
   ↓
Validate
   ↓
Activate
   ↓
Measure
   ↓
Iterate
```

The objective is not “more automation”.

The objective is **better decisions and a capability that remains after handoff**.

---

## Documents

### Professional

- [CV 2026 · Español](./Gracian_Baena_CV_2026_ES.pdf)
- [CV 2026 · English](./Gracian_Baena_CV_2026_EN.pdf)
- [Carta de presentación · Español](./Gracian_Baena_Carta_Presentacion_ES.pdf)
- [Cover Letter · English](./Gracian_Baena_Cover_Letter_EN.pdf)

### Yoga

Yoga documentation remains available as a separate professional track:

- [CV Yoga · Español](./Gracian_Baena_CV_Yoga_ES.pdf)
- [CV Yoga · English](./Gracian_Baena_CV_Yoga_EN.pdf)
- [Yoga Instructor](https://gracianb.github.io/yoga-instructor/)

---

## Quality contract

The repository is not considered releasable because it merely looks correct.

The pipeline checks:

- structural validation
- JavaScript syntax
- ES / EN runtime
- 12-slide curated contract
- dark / light themes
- command palette
- presentation mode
- timed, accessible 60-second briefing + interactive atlas
- role dialogs
- mobile navigation
- 390 px responsive layout
- no horizontal overflow
- reduced motion
- console / page errors
- SEO and canonical metadata
- local asset integrity
- production audit
- performance budgets
- CSS cascade budgets
- Playwright browser E2E

Run locally:

```bash
npm ci
npm run quality
```

---

## Public ecosystem

| World | Destination |
|---|---|
| Professional hub | https://gracianb.github.io/GracianB/ |
| Professional Deck | https://gracianb.github.io/professional-deck/ |
| Systems Lab | https://gracianb.github.io/systems-lab/ |
| Yoga | https://gracianb.github.io/yoga-instructor/ |

The deck is intentionally not the whole portfolio. It is the **professional evidence** inside that ecosystem.

---

## Contact

[LinkedIn](https://www.linkedin.com/in/gracianbaena) · [Email](mailto:gracianbaenagonzalez@gmail.com) · [Book 30 min](https://calendar.app.google/n99psBFktwYyoAWi9)

**Gracián Baena · Murcia, Spain · 2026**
