# CSS Maintenance Guide

## Current architecture
- style.css is now the entry manifest. It only wires files together, so HTML pages still load one stylesheet.
- variables.css stores design tokens and semantic theme variables. Put raw colors, spacing, shadow, and radius values here so they can be reused everywhere.
- base.css stores global reset and base element rules. Use it for body, html, anchors, and other defaults that should apply to every page.
- theme.css stores mode and display preference logic. Keep dark mode, font scaling, and animation toggles here so theme changes remain centralized.
- components.css stores consolidated shared surfaces, text, and form dark-mode rules. Put repeated card/input/button surface rules here when many pages use the same look.
- pages/dashboard.css, pages/planner.css, pages/goals.css, pages/notes.css, pages/stats.css store page-specific styles. Use these for UI that belongs to one page only.
- legacy-core.css, legacy-spa.css, and legacy-overlays.css hold remaining shared rules pending final extraction into dedicated layout/navigation/settings/auth modules. These are temporary holding files, not the final home for new styles.

## Quick Routing Table
| If you are changing... | Put it here | Why |
| --- | --- | --- |
| Raw colors, shadows, spacing, radius, fonts | variables.css | These values should be reusable tokens, not hard-coded duplicates. |
| Body defaults, anchors, resets | base.css | Global base rules should be defined once and inherited everywhere. |
| Dark mode, font scaling, reduced motion | theme.css | Theme switches should be centralized so one change affects the whole app. |
| Shared cards, buttons, inputs, tables | components.css | Repeated UI surfaces belong in one shared component layer. |
| Dashboard-only widgets/charts | pages/dashboard.css | Keeps dashboard styling isolated from other pages. |
| Planner table/layout/filter UI | pages/planner.css | Keeps planner-specific table rules easy to find and edit. |
| Goal cards/tabs/widgets | pages/goals.css | Keeps goal progress UI and linked-task widgets together. |
| Notes grid/cards/editor UI | pages/notes.css | Keeps note-card rendering and note editor styles together. |
| Stats cards/charts/insights | pages/stats.css | Keeps analytics UI isolated from other pages. |
| Shared leftovers still being migrated | legacy-*.css | Temporary home only, until the rules are split into a clearer module. |

## Import order (do not change)
1. variables.css
2. base.css
3. theme.css
4. components.css 
5. pages/*.css
6. legacy-core.css
7. legacy-spa.css
8. legacy-overlays.css

Why this order matters: the later a file loads, the easier it is to override earlier rules without using !important. Tokens must load first, page styles must load before legacy fallback, and the temporary legacy files must load last so they only fill gaps.

## Dark-mode strategy
- Define all theme values in variables. If a color or surface changes in dark mode, it should usually be a token change, not a selector-by-selector rewrite.
- Override variables in body.dark-mode once. That keeps the theme switch predictable and avoids repeating the same dark background/text values for many selectors.
- Components must use var(...) tokens. When a component relies on tokens, it automatically inherits theme changes, which is why we prefer this over hard-coded colors.
- Avoid adding new body.dark-mode .selector blocks unless absolutely necessary. Only use them for true exceptions, like a special modal surface or a one-off graphic treatment that cannot be tokenized cleanly.

## Adding new styles
1. Add or reuse a token in variables.css. If you need a color, shadow, spacing step, or radius that already exists, prefer the existing token instead of inventing a one-off value.
2. Put broad reusable rule in components.css. Use this for shared cards, inputs, button styles, tables, or common text treatments that show up on more than one page.
3. If rule is page-specific and still part of legacy migration, place it in the most relevant legacy-*.css file for now. This keeps the CSS valid while the old layout is still being broken apart.
4. Once a page has enough rules, move that page block into a pages/*.css module. A good sign is when a file starts collecting many selectors that only belong to one screen.

## Migration rule
- Keep visual parity first. The goal is a cleaner structure, not a redesign; every extraction should render the same before and after.
- Move one concern at a time from legacy-*.css modules into dedicated files. For example, move notes card styles together, not selector-by-selector across different modules.
- After moving, delete old blocks from legacy-*.css to avoid duplicate maintenance. Leaving both copies behind makes future edits ambiguous and reintroduces drift.
- Responsive overrides that still combine multiple pages can temporarily stay in legacy-spa.css until they are split per page. Shared breakpoints are acceptable during migration if splitting them would risk breaking layout.
- Notes card/grid/editor styles belong in pages/notes.css. Anything that changes the notes page layout or note-card appearance should land there first.
- Settings modal and floating settings controls still belong in legacy-overlays.css until they are split into a dedicated settings module. That file is the temporary home for overlay and modal UI that is shared or not yet fully isolated.
