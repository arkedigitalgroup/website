# Public Repositioning — Fidel as Arke's Main Academic Service

Last updated: 2026-10-21
Status: Complete (Stages 1–5), pending business answers

## Scope

Reposition the general public website of Arke Digital Learning around **Fidel academic
tutoring**, while keeping **Yeneta** as a functioning, clearly labelled religious-education
branch on its own pages. Public URLs, course IDs, enrollment records, authentication,
integrations and dashboards must be preserved.

Out of scope: production data changes, deployment, search-engine submission, new
analytics providers, any new infrastructure.

## Repository facts established during inspection

| Area | Source of truth |
| --- | --- |
| Public marketing copy | `src/locales/am.js`, `src/locales/en.js` (via `src/lib/i18n.js`) and hard-coded strings in `app/(public)/**/page.client.js` |
| Fidel public catalog | static import of `assets/fidelCourse.json` in `app/(public)/fidel/page.client.js` |
| Enrollment course list | Firestore `courses` collection, read by `src/hooks/Usecourses.js` |
| Yeneta public catalog | Firestore `courses` where `serviceLine == "yeneta"` |
| Navigation / footer | `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx` |
| Page metadata | `metadata` exports in `app/layout.js`, `app/(public)/*/page.js` |
| Sitemap / robots | `next-sitemap.config.js` (postbuild), generated into `public/sitemap*.xml`, `public/robots.txt` |
| Authentication / dashboards | `app/(auth)`, `app/(dashboard)`, Firebase Auth + Firestore rules |
| Testimonial / tutor fixtures | `app/(public)/components/featured.js` (imported nowhere in current public routes) |

### Course/catalog mismatch (pre-existing)

`assets/fidelCourse.json` uses `course_id` values such as `Fidel-012` and separate
`course_slug` values such as `fidel-mathematics-advanced`. The seeding script
(`scripts/seed-course.js`) writes the **slug** as the Firestore document ID. The public
Fidel page currently links to `/register?...&course=<course_id>`, so the selected course
is not guaranteed to match the Firestore-backed course selector. Repositioning work will
link with the slug (the same identifier enrollment already uses) and add a safe fallback
when a URL course is not present in the loaded list.

## Stage 1 — Content and external-platform audit

### External platform / institution references found

| Reference | Location | Assessment | Action |
| --- | --- | --- | --- |
| **LIQ Academy** | `assets/fidelCourse.json` — `Fidel-005` description and feature "LIQ Academy digital platform access" | No repository evidence of a working integration, partnership, reseller permission or endorsement. | Excluded from public promotion (`public_visibility: false`), claim removed from customer-facing description/features, internal review note retained. |
| **Yene Sekay** app | `assets/fidelCourse.json` — `Fidel-013` description and feature "Yene Sekay study app included" | No repository evidence of a working integration or permission. | Excluded from public promotion (`public_visibility: false`), claim removed, internal review note retained. |
| "Church-certified" / "church-verified" tutors | `app/layout.js`, `app/(public)/page.js`, `page.client.js`, `src/locales/*` | The application verifies teacher documents through admin approval; it does not establish church certification of every tutor. "100% Church Certified" is unsupported. | General pages will not use certification/verification claims. Yeneta pages may describe the documented teacher-review process without a universal certification claim. |
| "490+ expert tutors" | `assets/fidelCourse.json` — `Fidel-003` description/feature | No supporting data in the repository. | Removed. No replacement figure invented. |
| "95% success rate" | `assets/fidelCourse.json` — `Fidel-003` feature | No supporting data. | Removed. No replacement figure invented. |
| `500+ families`, `50+ teachers` counters | `app/(public)/page.client.js` (`StatsBar`, `heroDowntitle`) | No supporting data; animated counters imply measured totals. | Removed; replaced with factual coverage statements (grades, subjects, formats, location) from the catalog. |
| Named parent testimonials with 5 stars | `app/(public)/page.client.js`, `src/locales/*` | No consent/verification record in the repository. | Removed from general pages. No replacement testimonials invented. |
| "MSc-qualified", "8+ years", "native speakers", "24/7 support", "top percentile" | `assets/fidelCourse.json` | Not verified. | Removed or rewritten as neutral descriptions of the service process. |
| Google Maps / Leaflet, Firebase Auth/Firestore/Storage, Supabase Storage uploads, EmailJS, Africa's Talking | application code | Actual working technical dependencies. | Preserved. Not presented as marketing partnerships. |

### Unresolved business facts (questions for the business)

1. Which tutor-count, outcome or satisfaction figures are genuinely measured, and where is
   the evidence? Until answered, no figures are published.
2. Are there real, consented academic testimonials (name, area, service used)? None are
   currently published.
3. Is there any written agreement permitting Arke to promote LIQ Academy or Yene Sekay
   access? If yes, exact permitted wording is required before those courses return to the
   public catalog.
4. Registration/service fee conflict: `AGENTS.md` specifies 400 ETB student /
   200 ETB teacher registration and 100 ETB monthly service fee, while
   `scripts/seed-platform-config.js` seeds 0 / 0 / 100. Public pages therefore avoid a
   hard-coded registration amount and state that applicable fees are shown before
   submission. Confirm the live Firestore `platform_config/global` values.
5. Are all ten static Fidel catalog prices current? They remain the catalog source, but
   should be confirmed against the Firestore `courses` collection before promotion.
6. Which grades/areas are actually served outside Addis Ababa? Current copy and catalog
   are limited to Addis Ababa and Grades 5–12 (some courses narrower).
7. Are `Fidel-005` and `Fidel-013` deliverable at all without the external platforms? If
   not, they should be deactivated in Firestore as well (not done here).

### Verification of Stage 1 corrections

- Static catalog still parses as JSON and keeps all ten records (no data deleted).
- Externally dependent offers remain in the file but are flagged and filtered out of the
  public catalog.
- No Firestore records, enrollment records, authentication or dashboards were changed.

## Stage 2 — Public content and metadata

### Positioning implemented

Fidel is now the primary academic service on every general page. Yeneta is presented as a
separate, clearly labelled religious-education branch that keeps its own page and catalog.

| Page | Change |
| --- | --- |
| `/` (`app/(public)/page.client.js`, `page.js`) | Rebuilt as an academic homepage: Fidel hero, coverage statement (Grades 5–12, maths/sciences/languages, in-home/online/hybrid, Addis Ababa), services, subjects, featured public courses, how-it-works, parent expectations, progress reporting, FAQ, final CTA. Yeneta appears only as a single secondary link. |
| `/fidel` (`app/(public)/fidel/page.client.js`, `page.js`) | Public catalog driven by `src/lib/fidelCatalog.js`; course search, format and subject filters; empty/no-result states; per-course fee note; teacher CTA; links to the planned focus pages. Yeneta is not mentioned in course copy. |
| `/about` | Academic-first mission, how tutoring works, who teaches, and a plain statement that Yeneta is a separate religious-education service. |
| `/contact` | Direct click-to-call and email, what to include in a message, response expectation without a 24/7 claim. |
| Navbar | Order is Home → Fidel → About → Yeneta → Contact, with a persistent “Register” CTA pointing at `/register?role=student&line=fidel` and `aria-current` on the active item. |
| Footer | Academic tagline, focus links, click-to-call, no certification or affiliation claims. |
| `/yeneta` | Metadata and hero copy updated; the unsupported “church-verified/vetted” wording was removed. Course content otherwise unchanged. |

### Removed from general pages

- Church certification / “100% Church Certified” / church-verified tutor claims.
- Tutor-count, family-count, success-rate, years-of-experience and “native speaker” figures.
- Named parent testimonials and star ratings.
- 24/7 support and “top percentile” promises.
- Any implication that Arke is affiliated with, endorsed by, or reselling LIQ Academy or
  Yene Sekay.

### Bilingual copy

Every new or rewritten string is a key in `src/locales/en.js` and `src/locales/am.js`
(`src/lib/i18n.js` lookup, Amharic as the default language). No new i18n package was added.
Course titles/descriptions that exist only in the static catalog remain English-only, which
is recorded as an open question below.

### Enrollment continuity

- Public course CTAs link to `/register?role=student&line=fidel&course=<course_slug>`, using
  the Firestore document ID rather than the `course_id` label.
- `/register` keeps a fallback: if the requested course is not in the loaded list, the first
  active course is preselected instead of failing silently.
- Registration fees are not hard-coded in public copy; pages state that applicable fees are
  shown before submission (see question 4 in Stage 1).

### Stage 2 verification

- `pnpm build` completes with exit code 0; 27 routes prerender, including `/`, `/about`,
  `/contact`, `/fidel`, `/yeneta`, all dashboards and auth pages.
- The stale `public/AGENTS.md` copy described Fidel as “Coming soon (Phase 2)”; that line now
  reflects the academic-first positioning and points at the root `AGENTS.md` as authoritative.
  (The file is publicly served under `/AGENTS.md`; consider removing the copy.)
- No route was renamed, removed or redirected; all public URLs still resolve.
- No Firestore record, course ID, enrollment record, auth flow, dashboard behaviour or
  integration was modified.
- Only static catalog flags, copy, layout and locale keys changed.

### Additional open question

8. Should the English-only static catalog course titles/descriptions be translated into
   Amharic, or is English acceptable for subject-specific catalog content?

## Stage 3 — Design and parent enrollment

### Standardized course card

`src/components/fidel/FidelCourseCard.jsx` renders every public course with the same
information in the same order:

1. subject and format badges, 2. course name, 3. grade range and delivery mode,
4. description, 5. what is included, 6. expandable learning focus, session length, session
type, schedule and curriculum, 7. price with its billing unit and a Register button.

- The card is used by the homepage (`compact` variant) and the full catalog.
- Nothing is printed unless the record contains it; missing fields fall back to “—”.
- The Register button builds `/register?role=student&line=fidel&course=<course_slug>`.

### States

| State | Where | Behaviour |
| --- | --- | --- |
| Loading | `/register` course selector and fee block | Existing “courses loading” placeholder retained; no new spinner introduced. |
| Empty catalog | Homepage featured courses, `/fidel` | Defensive message plus a link to contact; the static catalog currently always has public courses, so this is a guard only. |
| No filter results | `/fidel` | Explicit “no courses match” message with a Clear filters button. |
| Form error | `/register` | Existing error banner preserved. |

The public marketing pages read a static JSON catalog, so they have no network loading or
error state to display; that is intentional and avoids adding a spinner for data that is
bundled at build time.

### Design corrections made in this stage

- **Navigation breakpoint**: the desktop navbar only fitted at wide screens; in English the
  row needed 1017px inside a 944px container, so the header scrolled horizontally at
  768–1100px. Desktop navigation and the wordmark now appear at `lg` and `xl`
  respectively, with the mobile menu below `lg`. The standalone logo block is hidden below
  `lg` so the mobile header does not duplicate it.
- **Colour contrast (WCAG AA)**: the brand teal `#0D9488` measured 3.5:1 on
  `--navy-surface`, below the 4.5:1 requirement for small text. A new text-only token
  `ft.teal-text` / `--ft-teal-text` (`#14B8A6`, 5.26:1) is applied to teal text. Gold step
  numerals moved from `gold/30` (1.8:1) to `gold/60` (3.4:1), which passes the 3:1 large-text
  threshold.
- **Document language**: `LanguageContext` now writes the active language to
  `document.documentElement.lang`, so assistive technology and crawlers see the language
  that is actually rendered. The `<html lang="am">` default remains for the server render.
- **Registration fallback order**: the course fallback effect referenced `courseId` before
  its `useState` declaration and crashed the register page; it now runs after all state
  declarations.

### Enrollment continuity verified

- `/fidel` card → `/register?...&course=fidel-mathematics-advanced`: the Firestore course
  selector loads ten active Fidel courses and preselects `fidel-mathematics-advanced`.
- Unknown slug (`course=not-a-real-course`): the selector falls back to the first active
  course (`in-person-home-tutoring-all-subjects`) instead of failing.
- The registration fee is read from Firestore `platform_config` (`registrationFeeStudent`)
  and shown before submission; no amount is hard-coded in public copy.

### Stage 3 verification

- `pnpm build` → exit 0 after the changes above.
- Lighthouse (dev build): `/` and `/fidel` score 100 for accessibility, best practices and
  SEO; no console errors on `/`, `/fidel`, `/about`, `/contact`, `/yeneta`, `/login`,
  `/register`.
- Contrast audit across `/`, `/fidel`, `/about`, `/contact`, `/yeneta`, `/login`,
  `/register`: no remaining failures.
- No horizontal overflow at 1000px on `/`, `/about`, `/contact`, `/login`, `/register` and
  `/fidel`; `/yeneta` overflow traced to the shared navbar and fixed.
- Mobile menu at 1000px exposes Home, Fidel, About, Yeneta, Contact and the Register CTA.

## Stage 4 — Technical SEO

### Metadata inheritance

`app/layout.js` previously described the company as an Orthodox spiritual **and** academic
service and used a “church-certified tutors” description, so every page without its own
metadata inherited religious framing and an unsupported claim. The root metadata is now:

- default title: “Arke Digital Learning | Fidel Academic Tutoring for Grades 5–12”
- template: `%s | Arke Digital Learning`
- academic-first bilingual description that names Yeneta only as a separate branch
- default Open Graph image (`/fidelPageHero.jpg`, 1280×696) and Twitter card
- no `canonical` at the root, because a site-wide canonical would be wrong for every
  sub-page

### Canonicals and social previews

Every public page sets its own `alternates.canonical`, `openGraph.url`, `openGraph.images`
and Twitter card. Verified in the prerendered HTML:

| Route | Canonical | robots |
| --- | --- | --- |
| `/` | `https://www.arke-group.com` | index, follow |
| `/fidel` | `https://www.arke-group.com/fidel` | index, follow |
| `/fidel/mathematics-tutoring` | `https://www.arke-group.com/fidel/mathematics-tutoring` | index, follow |
| `/fidel/exam-preparation` | `https://www.arke-group.com/fidel/exam-preparation` | index, follow |
| `/about` | `https://www.arke-group.com/about` | index, follow |
| `/contact` | `https://www.arke-group.com/contact` | index, follow |
| `/yeneta` | `https://www.arke-group.com/yeneta` | index, follow |
| `/login`, `/register` | none | noindex, nofollow, nocache |
| `/admin*`, `/student*`, `/teacher*` | none | noindex, nofollow, nocache |

### Private routes

`login` and `register` are client components and cannot export metadata, and no group
layout existed. Added `app/(auth)/layout.js` and `app/(dashboard)/layout.js` that set `noindex`
(plus `nocache` and a Googlebot override) and a neutral title. Both layouts only return
`children`, so rendering and auth behaviour are unchanged.

### Structured data

- `/`: `EducationalOrganization` + `WebSite` (verified parse).
- `/fidel`: `ItemList` of eight public `Course` entries with `AggregateOffer` pricing, plus
  `FAQPage` (verified parse).
- `/fidel/mathematics-tutoring` and `/fidel/exam-preparation`: `Course` + `BreadcrumbList`.
- Hidden courses (`Fidel-005`, `Fidel-013`) do not appear in any structured data.

### Robots and sitemap

- `next-sitemap.config.js` now excludes `/admin*`, `/student*`, `/teacher*`, `/login`,
  `/register`, `/api*`, `/404`, `/500`, and disallows the same prefixes in `robots.txt`.
- The `additionalSitemaps` entry that made `sitemap.xml` list itself was removed.
- `lastmod` was removed: the old config stamped the build time on every URL, claiming every
  page changed on every deployment. No date is published rather than a false one.
- Priorities now follow the academic-first order: `/` 1.0, `/fidel` 0.9, the two focus pages
  0.8, `/about` 0.6, `/contact` 0.5, `/yeneta` 0.5.
- Generated `sitemap-0.xml` contains exactly the seven public URLs; `sitemap.xml` is a
  one-entry index pointing at `sitemap-0.xml`.
- `additionalPaths` returned an array of unresolved promises, so next-sitemap silently
  dropped every added path; it now awaits them.

### Language switching / hreflang limitation

Language is a client-side toggle on a single URL (`localStorage` key `arke_lang`, default
Amharic). There are no separate `/am` and `/en` routes, so there are no distinct URLs to
advertise with `hreflang`, and `alternateRefs` stays empty. Publishing hreflang pairs that
point at the same URL, or inventing locale routes, would be incorrect. The active language
is now written to `<html lang>` at runtime so the rendered language is at least declared
correctly. A future real i18n routing change would be required before hreflang is meaningful.

### Stage 4 verification

- `pnpm build` → exit 0; `.next/server/app/*.html` inspected for title, robots, canonical,
  og:url, og:image and JSON-LD on every public and private route.
- No `hreflang` tags are emitted, which matches the single-URL architecture.

## Stage 5 — Search landing pages and final verification

### Pages created

| Route | Target course | Content |
| --- | --- | --- |
| `/fidel/mathematics-tutoring` | `fidel-mathematics-advanced` (`Fidel-012`) | Hero, five focus areas (algebra, geometry/trigonometry, calculus, statistics, exam practice), the real course card with price and inclusions, sibling-page link, CTA. |
| `/fidel/exam-preparation` | `grade-8-national-exam-prep-online` (`Fidel-002`) | Hero, what the programme includes, who it is for, format and schedule, the real course card, sibling-page link, CTA. |

Both pages use only public catalog records, link to `/register` with the matching
`course_slug`, keep click-to-call, use the shared bilingual keys (`math*`, `exam*`,
`landing*`), and carry their own metadata, `Course` and `BreadcrumbList` structured data.
`/fidel` already linked to both routes from its focus cards, so those links now resolve.

### Final verification

| Check | Result |
| --- | --- |
| `pnpm build` | exit 0, 29 routes prerendered |
| Preserved routes | `/`, `/fidel`, `/yeneta`, `/about`, `/contact`, `/login`, `/register`, `/admin`, `/student`, `/teacher` all return 200; unknown path returns 404 |
| Course IDs / slugs | Unchanged; hidden records kept, only `public_visibility` added |
| Enrollment | `fidel-mathematics-advanced` and `grade-8-national-exam-prep-online` preselected from the catalog links; unknown slug falls back to the first active course |
| Public catalog | 10 records, 8 public, `Fidel-005` and `Fidel-013` excluded from pages, structured data and sitemap |
| Sitemap | 7 public URLs, no dashboards, auth, API or `lastmod` |
| Robots | Private prefixes disallowed; sitemap referenced once |
| Metadata | Per-page canonical, OG/Twitter, noindex on auth and dashboards |
| Lighthouse (dev server) | `/`, `/fidel`, `/fidel/mathematics-tutoring`, `/fidel/exam-preparation`: 100 accessibility, 100 best practices, 100 SEO |
| Contrast | No WCAG AA failures on any public page |
| Console | No errors on any public page or `/register` |
| Unsupported claims | No tutor counts, success rates, certification claims, testimonials or external-platform affiliations on public pages |

### What is not verified

No deployment was performed and nothing was submitted to a search engine. Live indexing,
ranking, conversion, traffic or Core Web Vitals in production are therefore **not** verified,
and no such improvement is claimed. Lighthouse results are from a local development server,
not the production deployment.
