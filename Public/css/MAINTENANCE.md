# CSS Maintenance Guide

## Current architecture
- style.css is now the entry manifest.
- variables.css stores design tokens and semantic theme variables.
- base.css stores global reset and base element rules.
- theme.css stores mode and display preference logic.
- components.css stores consolidated shared surfaces, text, and form dark-mode rules.
- pages/dashboard.css, pages/planner.css, pages/goals.css, pages/notes.css, pages/stats.css store page-specific styles.
- legacy.css keeps remaining original rules while migration continues.

## Import order (do not change)
1. variables.css
2. base.css
3. theme.css
4. components.css
5. pages/*.css
6. legacy.css

## Dark-mode strategy
- Define all theme values in variables.
- Override variables in body.dark-mode once.
- Components must use var(...) tokens.
- Avoid adding new body.dark-mode .selector blocks unless absolutely necessary.

## Adding new styles
1. Add or reuse a token in variables.css.
2. Put broad reusable rule in components.css.
3. If rule is page-specific, place it near existing page block in legacy.css for now.
4. Once a page has enough rules, move that page block from legacy.css into a page module file.

## Migration rule
- Keep visual parity first.
- Move one concern at a time from legacy.css.
- After moving, delete old block in legacy.css to avoid duplicate maintenance.
- Responsive overrides that still combine multiple pages can temporarily stay in legacy.css until they are split per page.
