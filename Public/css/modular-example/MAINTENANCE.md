# CSS Modular Maintenance Guide

## Rule 1: Theme values live in one place
- Only define raw colors in variables.css and theme.css.
- Components and layouts should consume tokens (var(--...)) only.

## Rule 2: Never add a new body.dark-mode selector first
- Add or reuse a semantic token in theme.css.
- Update component styles to read that token.

## Rule 3: Organize by concern
- layout.css: structure/grid/containers
- navigation.css: sidebar + bottom nav
- components.css: cards/buttons/forms/tables/widgets/modals
- utilities.css: one-purpose helper classes
- responsive.css: breakpoint overrides grouped once per breakpoint
- pages/*.css: page-specific visual rules only

## Rule 4: Keep selector complexity low
- Prefer class selectors.
- Avoid deep chains unless needed for specificity.
- Use :is(...) to consolidate repeated target lists.

## Rule 5: Control responsive growth
- Keep each breakpoint in one file section, not scattered.
- New responsive behavior goes to responsive.css or page file breakpoint block.

## Rule 6: Add features with this checklist
1. Add/confirm tokens in variables.css/theme.css.
2. Add structural rules in layout.css if needed.
3. Add reusable UI rule in components.css.
4. Add page-only rule in pages/<page>.css.
5. Add responsive adjustments at the end of that file.
6. Verify light mode, dark mode, font scale, and no-animations still work.
