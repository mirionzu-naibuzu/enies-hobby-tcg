---
target: binder page (set binders, custom, wishlist)
total_score: 30
p0_count: 0
p1_count: 3
timestamp: 2026-08-29T21-33-07Z
slug: app-binder-page-tsx
---
# Design Critique: Binder Page (`app/binder/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Progress bars and owned/wished indicators are clear; Wishlist lacks total count and market value summary |
| 2 | Match System / Real World | 4/4 | Realistic card binder deck fans, 3D flip inspection, and physical collection metaphors |
| 3 | User Control and Freedom | 3/4 | Robust back navigation and bulk deletion; inline binder renaming lacks mobile touch commit affordance |
| 4 | Consistency and Standards | 3/4 | Scroll-to-top uses raw unicode `↑`; tab labels slightly drift from header titles |
| 5 | Error Prevention | 3/4 | Confirmation dialogs on destructive actions; binder name input lacks character limit or empty validation hints |
| 6 | Recognition Rather Than Recall | 3/4 | Visual card fan previews are intuitive; Wishlist tiles omit set codes and card ID badges |
| 7 | Flexibility and Efficiency | 3/4 | Multi-select bulk deletion is efficient; Wishlist lacks filtering/search for large collections |
| 8 | Aesthetic and Minimalist Design | 3/4 | Sleek card elevation and radial backdrop glows; Create Binder button glow is slightly loud |
| 9 | Error Recovery | 3/4 | Clear empty filter states with "Clear filters" action button and browse redirects |
| 10 | Help and Documentation | 3/4 | Auth arrival patterns and empty state guidance are helpful |
| **Total** | | **30/40** | **Good** |

## Anti-Patterns Verdict

- **LLM Assessment**: High craft foundation. The physical binder deck fan preview and 3D card flip interactions feel authentic and tailored to TCG hobbyists. It avoids generic SaaS templates.
- **Deterministic Scan**: Scan entrypoint unavailable.
- **Visual Inspection**: The 3 main tabs (**Set Binders**, **Custom Binders**, and **Wishlist**) are clearly organized, with strong visual feedback on collection completion rates.

## What's Working

1. **Physical Card Fan Previews**: The 4-card angled stack (`-5deg` / `5deg`) on binder and set cards immediately showcases real card art and collection identity.
2. **Real-Time Set Completion Progress**: Clear percentage metrics and reactive progress bars give collectors tangible satisfaction as sets are completed.
3. **Multi-Select Bulk Management in Custom Binders**: Fast, intuitive selection mode with batch removal and deletion safeguards.

## Priority Issues

- **[P1] Wishlist Filtering & Summary Metrics**: In the **Wishlist** tab, collectors with dozens of saved chase cards have no search bar, color filters, or set grouping, making large wishlists difficult to manage.
- **[P1] Custom Binder Mobile Rename Affordance**: Renaming a binder inline depends on the `Enter` key, which creates friction on mobile/virtual keyboards without an explicit save checkmark button.
- **[P1] Scroll-To-Top Icon Regression**: The floating scroll-to-top button uses raw unicode `"↑"` without vector iconography (`ArrowUp`) or `aria-label`.
- **[P2] Visual Hierarchy & Button Balance**: The "Create Binder" button has a high-intensity gradient and heavy drop shadow (`${tc.accent}55`) that dominates the page, while the top global progress bar is only `2px` thin.
- **[P2] Empty State Border Glitch**: The empty custom binder illustration has an unstyled `borderBottom: "solid 1px"`.

## Persona Red Flags

- **Marcus (Set Completionist)**: Loves the set progress bars, but when browsing his 60-card Wishlist, cannot filter by color or set to decide which singles to buy next.
- **Ken (Mobile Collector)**: Taps to rename a custom binder on his iPhone, but struggles to confirm the rename without a visible submit checkmark button.
- **Elena (Power User)**: Expects a quick "Move to Binder" or "Mark as Owned" button directly on wishlist cards without having to open the full modal.

## Minor Observations

- Tab indicator line is `1.5px solid`, which can render slightly soft on standard-DPI monitors compared to standard `2px`.
- In custom binders, cards have individual `X` remove buttons on hover, but no subtle confirmation tooltip before instant removal (unlike bulk delete).

## Questions to Consider

- What if the Wishlist tab featured a compact toolbar with search, set filter, and total estimated market value?
- What if custom binder cards showed a clean checkmark/submit button alongside the inline rename input?
- Should the top global progress bar be `4px` or `6px` with rounded pill ends to match the set progress bars?
