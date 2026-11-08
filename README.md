# NDTalk

Six main pages plus a footer-only Privacy Policy page, built as accessible, responsive static HTML for Dr. Carrie Mitran’s coaching practice. No client framework, runtime packages, third-party embeds, trackers, or database.

## Edit

- Content and reusable HTML components: `scripts/build.mjs`.
- Navigation, booking, portal and canonical origin: `scripts/config.mjs`.
- Design tokens and responsive layout patterns: `dist/assets/styles.css`.
- Menu and email-draft behavior: `dist/assets/site.js`.
- Images and self-hosted fonts: `dist/assets/`.

`dist/assets/` is maintained source, not disposable build output. The build regenerates HTML, sitemap, robots, and the 404 page while preserving assets. Keep the output checked into source so the website can also be hosted directly as static HTML.

## Run

Node 24+ and Python 3:

```sh
npm ci
npm run build
npm test
npm run serve
```

Visit http://localhost:4173. In a second terminal:

```sh
npx playwright install chromium
npm run test:e2e
npm run test:a11y
```

Browser tests use an installed `/usr/bin/chromium` if present, otherwise the Playwright browser. Override with `CHROMIUM_PATH`. Override the test destination using `TEST_URL`.

For a mobile Lighthouse audit:

```sh
CHROME_PATH=/usr/bin/chromium npx lighthouse http://localhost:4173/ --chrome-flags='--headless --no-sandbox' --output=json --output-path=test-results/lighthouse-mobile.json
```

## Design system

Gallery white `#f7f5ef`, ink `#302e29`, terracotta `#a0442b`, olive `#62664e`, stone `#eae5dc`. Cormorant Garamond for editorial headings, DM Sans for body copy, Georgia italic for emphasis. Both heading and body fonts are preloaded, with metric-adjusted Times/Arial fallbacks to reduce layout changes during loading. Styles and scripts use content-versioned URLs to avoid stale files after updates. Fonts are self-hosted; their SIL Open Font License files are in `dist/assets/`.

Shared patterns include page hero, editorial split, audience list, three-column principles, olive band, closing invitation, header, and footer. Mobile navigation appears below 961px; layouts stack below 701px. Respect reduced-motion preferences. New pages should use the shared patterns and spacing tokens instead of copying independent style values.

## Functionality and launch notes

The footer year updates on page load using the visitor’s current calendar year, without requiring a new deployment. The generated year remains as the no-JavaScript fallback.

- Client Login points to the user-provided `https://portal.ndtalk.io/`.
- Consultation links preserve the existing Calendly event and omit stale date/query filters. The consultation is paid; no unverified fee is stated.
- The contact form validates matching email addresses and consent, then opens a mailto draft. It does not send, store, or claim delivery. Configure a real delivery endpoint before changing it into a direct submission form.
- The Library contains planned collections only. No products, prices, payment integration, or course access are represented as live.
- The private Sites preview is separate from the current public site. Private access prevents public indexing even though the pages have complete SEO metadata.
- Before moving to the public domain, set `SITE_ORIGIN=https://www.neurodiversetalk.com npm run build`, check all canonical/social/sitemap URLs, confirm business information and editorial CSR copy, and apply the redirect mapping in `docs/seo-content-review.md` on the destination host.
- `_headers` supplies cache and security policy for hosts supporting that format. Confirm actual headers on the chosen host; the local Python server does not apply them. Retain Sites’ native private-access behavior.

See `docs/seo-content-review.md` for source accuracy and migration decisions.

## Privacy and terms

The footer-only `/privacy-policy/` page preserves the exact Privacy Policies and Terms of Use PDF links from the original https://www.neurodiversetalk.com/form page. Document destinations live in `scripts/legal.mjs`. No policy text was generated or revised. The PDF host could not be independently fetched in this environment; validate both downloads before retiring the original file hosting.
