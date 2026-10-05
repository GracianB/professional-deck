# CSS Cascade Map · Professional Deck

Generated from `main` before the refactor branch. This is a **mapping artifact**, not permission to delete CSS blindly.

## Production load order

1. `styles.css`
2. `extra-pass.css`
3. `final-v3.css`
4. `final-v4.css`
5. `portada-extreme.css`
6. `deck-fix.css`

## Baseline from the validated forensic audit

| Metric | Result |
|---|---:|
| CSS total | 440.63 KB |
| CSS rules | 2,606 |
| `!important` occurrences | 4,680 |
| Exact selector collision groups | 477 |
| Exact selector collision pairs | 3,870 |
| Selector + property collision groups | 1,614 |
| Selector + property collision pairs | 6,227 |
| Potentially unused class candidates | 101 |
| Potentially unused ID candidates | 1 |

These numbers are the project's existing forensic baseline. The parser in `tools/css-cascade-map.mjs` is intentionally context-aware and should be used for subsequent mapping runs.

## Highest-risk consolidation targets

### 1. Experience panels

The same contracts are repeatedly restated across `extra-pass.css`, `final-v3.css` and `final-v4.css`.

Examples:

- `#experiencia .gb-exp-panel`
- `#experiencia-2 .gb-exp-panel`
- `#experiencia .gb-roles`
- `#experiencia-2 .gb-roles`
- `#experiencia .gb-role`
- `#experiencia-2 .gb-role`
- `#experiencia .gb-panel-bar`
- `#experiencia-2 .gb-panel-bar`

Notable final-value chains include `max-height`, `min-height`, `padding` and panel-bar sizing. These should be consolidated only after confirming the intended final values at desktop, tablet and mobile breakpoints.

### 2. Slide shell

The base contracts for `.slide` and `.slide.fit` are repeatedly overridden.

Known competing properties include:

- `justify-content`
- `align-items`
- `gap`

This is a high-impact area because changing the shell changes many slides at once.

### 3. Hero / portada

The hero is deliberately layered across:

- `styles.css`
- `extra-pass.css`
- `final-v3.css`
- `final-v4.css`
- `portada-extreme.css`

High-risk selectors include:

- `#inicio .gb-hero-stack`
- `.gb-hero-copy h1`
- `.gb-hero-copy h1 em`
- `.brand-mark`
- `.top-progress i`

`portada-extreme.css` is not redundant merely because it overrides older rules. It contains the final visual contract for the cover.

### 4. Header controls

Repeated contracts exist for:

- `.brand-mark`
- `.brand-text b`
- `.brand-text small`
- `.header-cta`
- `.deck-controls button`
- `.deck-hint`

The current cascade relies heavily on source order and `!important`. These are good candidates for canonicalization, but not blind deletion.

### 5. Route / map

The route system is spread across several files, including:

- `.gb-route-top`
- `#ruta .gb-route-map`
- `#ruta .gb-city-panel`
- `#ruta .gb-spoke`
- `#ruta .gb-pin`

`deck-fix.css` contains explicit SVG/pin geometry fixes and therefore must be treated as behaviorally meaningful until browser E2E confirms an equivalent canonical implementation.

### 6. Contact metrics

`deck-fix.css` contains a focused contract for:

- `#contacto .gb-contact-metrics`
- `#contacto .gb-contact-bottom`
- contact action buttons

This file is small and should not be removed just because it is named a "fix".

## Safe refactor rules

1. Do not delete an entire stylesheet because its rules are overridden elsewhere.
2. Preserve responsive, theme, accessibility and reduced-motion contexts.
3. Remove `!important` only when specificity and source order have been re-established in the canonical layer.
4. Treat JavaScript-generated/state classes as live until browser/runtime inspection proves otherwise.
5. Do not delete the 101 unused-class candidates without checking runtime references.
6. Do not delete duplicate assets until references have been scanned and a canonical filename selected.
7. Keep the existing production load order unchanged while building the canonical layer.
8. Compare visual/browser behavior before and after every section migration.

## Recommended migration order

1. Header primitives
2. Slide shell
3. Shared panel primitives
4. Experience section
5. Route/map
6. Contact
7. Hero
8. Remaining section-specific overrides
9. Only then remove superseded legacy rules/files

## Current decision

**Do not delete `extra-pass.css`, `final-v3.css`, `final-v4.css`, `portada-extreme.css` or `deck-fix.css` yet.**

The architecture is clearly override-heavy, but the safe solution is a controlled canonicalization, not a mass deletion. The branch therefore adds the mapping tooling and repairs the missing PWA/HTML contract without changing production CSS behavior.


## Phase 2 — superseded declaration consolidation

Applied a second conservative pass after the exact-rule deduplication. The pass removed only single-selector rules whose complete declaration set was demonstrably reproduced later by the same selector in the same cascade context. No multi-selector rule was split, no media/container context was crossed, no keyframe rule was touched, and no stylesheet was removed.

Removed:
- styles.css: 6 superseded rules
- extra-pass.css: 8 superseded rules
- final-v3.css: 4 superseded rules

Current branch CSS snapshot (post-pass):
- styles.css: 147,831 chars / 764 !important / 1,116 parsed regex blocks
- extra-pass.css: 96,916 chars / 1,409 !important / 529 parsed regex blocks
- final-v3.css: 42,269 chars / 686 !important / 229 parsed regex blocks
- final-v4.css: 77,180 chars / 863 !important / 338 parsed regex blocks
- portada-extreme.css: 21,307 chars / 258 !important / 100 parsed regex blocks
- deck-fix.css: 3,970 chars / 48 !important / 27 parsed regex blocks

This pass is intentionally narrower than a visual redesign: it removes declarations that were already fully superseded later in the cascade while preserving the existing stylesheet order and component behavior.


## Phase 3 — same-value cascade elimination

Applied a stricter safe pass: for single-selector rules in the same cascade context, an earlier declaration was removed only when the exact same property/value pair appeared later for the same selector/context. This does not alter the winning computed value and does not touch fallbacks with different values, multi-selector rules, keyframes, or cross-context rules.

Removed declarations:
- styles.css: 141
- extra-pass.css: 15
- final-v3.css: 18
- Total: 174 declarations

Current branch snapshot:
- styles.css: 144,402 chars / 758 !important
- extra-pass.css: 96,324 chars / 1,399 !important
- final-v3.css: 41,723 chars / 669 !important
- final-v4.css: 77,180 chars / 863 !important
- portada-extreme.css: 21,307 chars / 258 !important
- deck-fix.css: 3,970 chars / 48 !important

The pass intentionally leaves the remaining conflicting values intact because different-value declarations can be deliberate responsive/theme fallbacks or cascade overrides.

## Current guard baseline · 2026-10-05

Final baseline after the conflict cleanup:

| Metric | V1-era baseline | Current | Guard limit |
|---|---:|---:|---:|
| CSS rules | 2,354 | 2,279 | 2,300 |
| `!important` occurrences | 3,623 | 3,298 | 3,320 |
| Duplicate selector/property groups | 512 | 299 | 305 |
| Conflicting selector/property groups | 928 | 876 | 890 |
| CSS bytes | 368,539 | 344,015 | 512,000 |

The cleanup removed superseded header/control/theme layers, redundant declarations, empty rules, duplicate theme rules, and other provably losing cascade entries while preserving responsive, theme, accessibility and section-specific behavior.
