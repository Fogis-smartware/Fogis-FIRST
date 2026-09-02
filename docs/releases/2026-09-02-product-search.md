# 2026-09-02 Product Search Release

## Scope

- Added `search.html` as a bilingual product search results page.
- Added multi-result model and keyword search, recent searches stored locally, and clear-history control.
- Updated the homepage search control to use a native `GET search.html?q=<query>` form fallback. Enter now works even before the enhancement script has loaded.
- Updated the search results input to remove the inherited blue focus ring.

## Files Released

- `index.html`
- `search.html`
- `search.js`
- `search-utils.js`

## Verification

- Static tests: 16 passed, 0 failed.
- Static audit: 342 HTML files scanned with no findings.
- Browser checks: early Enter navigation, loaded-page Enter navigation, and search-button navigation all reached `search.html?q=<query>`.
- Search input focus style: computed `box-shadow` is `none`.

## Excluded From This Release

- No changes to `contact.html` or Formspree.
- No product-page quote-link changes.
- Product inquiry context and prefilled quote forms remain planned future work.

## Recovery

The pre-release production revision is tagged `backup/pre-product-search-2026-09-02` at commit `b16f326`.
