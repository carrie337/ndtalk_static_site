# Validation

The local review build was checked with a real headless Chromium browser.

- Six Node test groups passed: page/SEO invariants, link and asset integrity, sitemap and forthcoming-product safeguards, and file-size performance budgets, and restored professional-profile content/link integrity.
- 29 end-to-end browser scenarios passed: all seven pages at 390px, 768px, and 1440px; mobile menu open/close, Escape and page navigation; FAQ interaction; mismatched-email validation; email draft generation; and navigation with JavaScript disabled, and a simulated January 2027 copyright-year rollover.
- All six pages passed an additional horizontal-overflow check at 320px.
- Axe found no WCAG 2 A/AA or WCAG 2.1 AA violations across the seven pages at mobile width. Automated checks do not substitute for a complete human accessibility audit.
- Final local mobile Lighthouse homepage audit: Performance 100, Accessibility 100, Best Practices 100, SEO 100. Largest Contentful Paint approximately 1.7 seconds, Cumulative Layout Shift 0, Total Blocking Time 0ms. These are local lab results, not production or field measurements.
- Full-page screenshots were reviewed across desktop and phone layouts. Shared styles, portrait rendering, menu behavior, and form feedback were checked.

The mobile menu's JS capability class is applied before first paint to prevent a layout jump. Navigation remains visible if JavaScript is disabled. The email-app handoff preserves the page and its draft-recovery link. No form delivery or paid-product checkout service is configured or claimed.

Production private access is verified through the Sites deployment result; public search indexing and the current public domain have not been changed. External portal and Calendly link destinations were verified against the user-provided URL and current website; authenticated portal behavior and booking completion were not tested.

Run instructions are in README.md. The included GitHub Actions workflow reruns the focused checks and preserves browser evidence if this source is placed in a GitHub repository.

Follow-up refinements: both fonts preload, metric-adjusted fallback fonts minimize reflow, and a cold-font test with 500ms delayed font requests recorded CLS 0. Client Login alone carries the new-tab arrow and opens securely in a new tab. The contact checkbox is aligned to the first label line, and both email fields have explicit email types, labels, input modes and email-specific autocomplete hints. Browser-extension autofill behavior cannot be guaranteed by HTML alone.

Profile restoration checks: all ten training/leadership entries and five stable publication destinations are checked in source tests. Browser checks verify a single contact-field focus treatment and desktop logo/content alignment. Additional manual browser measurements confirmed matching header/content left edges with no horizontal overflow at 961, 1024, 1180, 1440, and 1920 pixels. The restored profile scored 99 Performance and 100 Accessibility, Best Practices, and SEO in a local mobile Lighthouse audit.

Privacy page: footer-only link presence and header exclusion are verified on all seven pages. The two PDF destinations match the original `/form` page exactly. The file host could not be retrieved by the research tool, so document contents and download availability remain unverified; original legal content was not rewritten.
