# Updated portfolio frontend

This directory is **Frontend Version 2**. Existing layout, animation, colors, and component structure remain; portfolio content is served by the backend CMS. `/admin/navbar` and `/admin/footer` edit the shared profile record. Projects, experience, and education support numeric display order; skills can be moved in their editor. Profile and project image fields support persistent Cloudinary uploads through the authenticated backend. Configure Cloudinary only on the backend.

The redesigned React frontend uses the existing Express/MongoDB backend. Its public pages and forms now read and write real data; there is no simulated API fallback.

## Run locally

1. Start the backend using `../JM-PortFolio-Server/README.md`.
2. Run `npm ci` here.
3. Copy `.env.example` to `.env.local` if you need to override the API location. By default, `/api/v1` proxies to `http://127.0.0.1:5000` during development.
4. Run `npm run dev` and open `http://localhost:3000`.

For a separate backend, set `VITE_API_BASE_URL=https://your-backend.example/api/v1` before building. `VITE_API_URL` is also supported and accepts either an origin or a base ending in `/api/v1`. Client environment values are public: never place secrets here.

## Admin

Open `/admin` or `/admin-login`. Use the existing backend admin account. The admin is part of this new frontend and uses its dark glass styling. Direct section links work after refresh:

| Route | Managed content |
| --- | --- |
| `/admin/intro` | Name, role, avatar, hero headline and descriptions, footer |
| `/admin/about` | About headline, biography, story and editable skill percentages |
| `/admin/project` | Projects, categories, images, URLs, browser-bar text and technologies |
| `/admin/experience` | Career history |
| `/admin/education` | Degrees, institutions, dates and status |
| `/admin/course` | Courses, instructor, category, badge and curriculum URL |
| `/admin/blog` | Article titles, unique slugs, date, excerpt and full body |
| `/admin/contact` | Contact card, availability, timezone, heading, social and resume links |
| `/admin/messages` | Private paginated contact-message inbox |

Use `/admin/visibility` to show or hide Technical Articles and Data & ML. Technical Articles start hidden; their records remain editable at `/admin/blog`. Use `/admin/data-ml` to create, edit, hide, feature, or delete Data & ML projects. Each project has optional field visibility switches and uses the existing image upload control. Data & ML appears immediately after the main project cards when its section switch is on.

New records can be created from an empty database. Saves use the server-returned record, deletions ask for confirmation, unsaved edits warn before navigation, and expired sessions require sign-in. Public content refreshes on page load. Preview in a separate tab with “View portfolio” and reload after edits.

The existing resume is available at `public/resume.pdf`. Older local image paths should be replaced using the admin upload control after Cloudinary is configured. Empty optional links are hidden. Accent selection remains a visitor preference.

The original client's compatibility build was verified with `npm ci --ignore-scripts`: its existing `react-particles` and `react-tsparticles` dependencies conflict in their install scripts. This does not affect installation of this updated frontend.

## Existing design content

`src/data/content.js` is retained solely as an optional migration source, not runtime data. To populate new design fields, review and run the backend's `import-design` dry run, then apply if desired. This also initializes education and articles, which had no backend models before. The original frontend remains separate in `JM-Portfolio-Client`, with its API authentication adapted for compatibility; use this frontend's admin for the new fields.

## Build and deployment

```sh
npm run lint
npm run build
```

`npm run test:ui` runs browser tests with a mocked API contract. Install the test browser once with `npx playwright install chromium`. You can also set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an installed Chromium executable. The backend has a separate test suite using a real temporary MongoDB database.

Use `updated-frontend` as the frontend project root and publish `dist`. Netlify `_redirects` and Vercel rewrites support direct admin routes. Production does not use the Vite development proxy: configure the absolute backend URL before building, or configure your host to proxy `/api/v1` explicitly. Start/redeploy the upgraded backend before switching the frontend.

No Gemini API key is needed. Backend connection settings and admin credentials stay on the backend.

Skills use seven editable category cards with compact technology chips, without proficiency ratings or per-skill project links. See [the Skills redesign report](SKILLS-REDESIGN.md) for content, evidence, validation, and backend adoption steps.
