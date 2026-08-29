---
target: app/don/page.tsx
total_score: 28
p0_count: 0
p1_count: 1
timestamp: 2026-08-28T23-13-18Z
slug: app-don-page-tsx
---
# Design Critique: DON!! Cards (`app/don/page.tsx`)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Grid skeleton and count indicators are clear; lacks toast feedback on binder additions |
| 2 | Match System / Real World | 3/4 | Clean card and set name parsing; gold distinction matches TCG lore |
| 3 | User Control and Freedom | 4/4 | Keyboard navigation (ESC, Left/Right), swipe support, and clear search input |
| 4 | Consistency and Standards | 2/4 | Raw unicode text arrow `"↑"` on scroll button; hardcoded inline gradient on gold chip |
| 5 | Error Prevention | 3/4 | Image error fallbacks in place; prevents empty binder creation |
| 6 | Recognition Rather Than Recall | 3/4 | Clear wishlist corner badge; active filter highlighting |
| 7 | Flexibility and Efficiency | 3/4 | Keyboard modal navigation and Gold filter chip; lacks quick `/` key search accelerator |
| 8 | Aesthetic and Minimalist Design | 2/4 | 3 stacked horizontal divider borders create heavy visual fragmentation in the top section |
| 9 | Error Recovery | 3/4 | Clean empty state with illustration and actionable recovery copy |
| 10 | Help and Documentation | 2/4 | No introductory subtext or tooltip explaining DON!! card rules/utility to newcomers |
| **Total** | | **28/40** | **Good** |

#### Anti-Patterns Verdict

- **LLM assessment**: The page has a great foundation with responsive card flipping and high visual contrast, but suffers from "stacked toolbar syndrome"—three separate horizontal border strips right below the header (`Title → Search/Filter Chips → Showing X cards count`). This chops up vertical space and creates visual clutter before reaching the cards.
- **Deterministic scan**: Bundled CLI detector entrypoint unavailable in environment; verified via thorough source and AST inspection.
- **Visual overlays**: Overlay injection skipped (no live browser debug session attached).

#### Overall Impression

A vibrant, TCG-authentic collection page with smooth card flip micro-interactions, but let down by a fragmented 3-tier top layout and inconsistent styling tokens (e.g. raw text `"↑"` instead of vector icons, hardcoded gold gradient). Consolidating the top header and unifying the design tokens will elevate this page from "functional browser" to a polished showcase.

#### What's Working

1. **Delightful 3D Card Flip Animation**: The `@keyframes cardFlipIn` flip-in animation on first render creates an exciting pack-opening feel tailored to TCG collectors.
2. **Robust Multi-Modal Navigation**: Full support for keyboard arrow keys, escape dismiss, and mobile touch swipe gestures makes card browsing fast and fluid.
3. **Clean Wishlist & Custom Binder System**: Dedicated popover allows users to assign DON!! cards to specific custom binders or wishlist without confusing set-ownership baggage.

#### Priority Issues

- **[P1] Fragmented Multi-Tier Header Layout**
  - **Why it matters**: Stacking three full-width border dividers for Title, Search/Chips, and Result Count pushes the actual card grid down the screen and creates unnecessary vertical visual noise.
  - **Fix**: Consolidate Title, Search Input, Filter Chips, and Count into a unified, responsive single-tier toolbar.
  - **Suggested command**: `impeccable layout`

- **[P2] Inconsistent Design System Glyphs & Colors**
  - **Why it matters**: The scroll-to-top button uses a raw text string `"↑"` while the rest of the application uses Lucide React vector marks; the "Gold" filter button uses hardcoded CSS gradient colors (`#facc15`, `#eab308`) rather than unified theme tokens.
  - **Fix**: Replace `"↑"` with Lucide `<ArrowUp size={20} />` and refactor the Gold chip to use theme-aware accent variables.
  - **Suggested command**: `impeccable polish`

- **[P3] Accessibility & Modal Dialog Semantics**
  - **Why it matters**: Screen readers cannot identify the card detail overlay as a modal dialog, and keyboard users lack a global shortcut (like `/`) to jump into search.
  - **Fix**: Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to the modal container, and add `aria-label="Scroll to top"` on the floating button.
  - **Suggested command**: `impeccable harden`

#### Persona Red Flags

- **Alex (Impatient Power User)**: Cannot press `/` or `Cmd+K` to immediately focus the search bar; card flip animation triggers on every search keystroke, delaying immediate visual scanning.
- **Jordan (Confused First-Timer)**: No subtle explainer text on what DON!! cards do in the One Piece TCG or why only "All" and "Gold" filters exist.
- **Sam (Accessibility-Dependent User)**: Scroll button lacks an accessible `aria-label`; modal overlay lacks dialog roles and focus trapping.

#### Minor Observations

- The search input is centered inside `.don-search-wrap`, while the title and count are left-aligned, creating an unbalanced reading rhythm.
- The 3D flip uses an inline `<style>` tag within the component body rather than modular CSS classes.

#### Questions to Consider

- "What if the search and filter chips were integrated directly into the main header row to bring the card grid immediately into view?"
- "Could gold cards have an ambient gold shimmer card effect on hover instead of a hardcoded inline gradient button?"
