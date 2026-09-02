# Product Inquiry Context Release Record

Date: 2026-09-02

## Scope

Product quote links now carry the selected product model into the existing contact page. Direct navigation to `contact.html` remains a generic inquiry.

## Changes

- Updated the two quote entry points on all 317 product pages.
- Quote links use `contact.html?product=<MODEL>&source=product-page`.
- Added validated product context to `contact.html`.
- Added a 64px product thumbnail and bilingual category label to the visible inquiry context.
- Matched the inquiry context container to the contact form field styling.
- Applied explicit 64px image dimensions because the static Tailwind bundle does not include the `w-16` and `h-16` utilities.
- Rendered the product category as separate bilingual elements so the existing language switcher controls it correctly.
- Added a bilingual `View product details / 查看产品详情` link to the selected product context.
- Unified the shared search dependency order across all 341 standard site pages with navigation search.
- Added hidden Formspree fields: `product_model`, `product_page`, and `inquiry_source`.
- Kept the ordinary `CONTACT` navigation link as `contact.html`.
- Added regression coverage for product links and contact-page context validation.

## Backup

- `backup/pre-product-inquiry-2026-09-02`

## Verification

- Static tests: 18 cases.
- Full static audit: 342 HTML files scanned.
- `git diff --check`: passed.

## Deployment

This change is prepared locally only. It has not been committed or pushed.
