# Professional Development

## Files changed

Frontend: src/components/ProfessionalDevelopment.tsx (new), src/components/AboutSection.tsx (Courses block and course refresh only), src/data/training.js (new), src/data/content.js (course seed only), src/api/index.js (course adapter, save checks and deletion notification), src/admin/fields.ts, src/admin/Admin.tsx (training controls only), tests/portfolio.spec.ts, PROFESSIONAL-DEVELOPMENT.md.

Backend: model/portfolioModel.js, routes/portfolioRoute.js (Course sorting only), scripts/migrate-training.js (new), package.json, test/integration.test.js, test/unit.test.js.

## Schema / API / admin

The existing Course model and course CRUD endpoints are retained. Added provider, type (course/training), status (completed/in-progress), duration, dateLabel, shortDescription (maximum 300 characters), technologies, visible, displayOrder and optional certificateUrl. dateLabel supports the supplied year range without inventing calendar dates. displayOrder follows the existing lower-first numeric ordering convention.

About stores coursesTitle, coursesSubtitle, existing coursesSectionVisible and a one-time migration marker. Courses admin includes an inline section-settings form, item create/edit/delete, visibility, order, and all new content fields. No curriculum URL is required. Optional certificate/evidence URLs can be maintained in admin; no certificates or links are invented or rendered as curriculum buttons.

The legacy description, instructor, category, badge, image and link fields remain for data compatibility but are not used for promotional card content. Known old Programming Hero records are adapted using only the owner's supplied facts. Unknown courses receive no invented status or description. Existing short summaries and explicit empty values remain authoritative.

## Final section structure

Professional Development

Courses and hands-on training that shaped my software development and current Data/ML direction.

Three compact glass cards in the existing position, with provider, status, duration/year range, short description and focus-area chips. Cards reuse the existing typography, surface colors, borders and Motion reveal easing. Padding is consistent and row/column gaps are both 16px; mobile stacks naturally. Reduced motion is respected. Mobile and tablet use one full-width column; wide desktops use three equal-width columns, avoiding a half-empty tablet row. TypeScript and production build passed, as did all 25 backend tests. The 22 existing browser regressions passed, followed by all five targeted training checks after correcting a test locator. Screenshots at 390px, 768px and 1440px were inspected.

## Final content

### Complete Web Development

Programming Hero · Completed · 6 months

Full-stack web development fundamentals with hands-on practice across the MERN stack.

JavaScript · React · Node.js · Express.js · MongoDB · REST APIs · Full-Stack Web Development

### Next Level Web Development

Programming Hero · Completed · 6 months

Advanced web development covering TypeScript, React architecture, state management, Next.js and modern application development.

TypeScript · Advanced React · Redux · Next.js · GraphQL · Modern Web Development

### Data Science & Machine Learning

Forward IT · Training Program · In Progress · 2026 – Present

Hands-on training and project-based learning in Python, data analysis and classical machine learning.

Python · NumPy · Pandas · Seaborn · Data Analysis · EDA · scikit-learn · Regression · Classification · KNN · Clustering · Model Evaluation

## Manual verification / adoption

Changes are local, not deployed. Deploy the backend and frontend together. Existing databases need the course-only migration to add Forward IT and persist missing fields. From JM-PortFolio-Server, with updated-frontend present as its sibling:

```powershell
npm run migrate-training
npm run migrate-training -- --apply
```

The first command previews. The second updates missing fields and adds supplied courses; it preserves custom edits, existing links, item visibility and unrelated sections. A migration marker prevents recreating deliberately deleted training on reruns. Review the preview if existing custom course records share the same titles. An About record must already exist. Production data was not changed during implementation.

Verify any custom course summaries before publishing. Exact dates and certificate links remain optional and should only be added from actual records. Forward IT is training, not employment or an internship.
