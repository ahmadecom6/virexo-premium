# Virexo Premium — circular cards, login repair & Vex AI

## Open this updated version

Extract this ZIP into a **new folder**, then open `Virexo-Innovations-Premium` in VS Code or Antigravity. Stop the old development server with Ctrl+C. Run these commands in the folder containing this file and `package.json`:

```bash
npm ci
npm run dev:all
```

Use Node.js 22.12+ or Node.js 24. Open the address printed by Vite, normally http://localhost:5174. A different port means another development server is still running. Always use the newly printed address. Your previous running folder does not automatically receive changes from this ZIP.

The existing sign-in flow remains. Use **Executive Demo**, **Sign In to Portal**, then **Explore Public Website** for a local demo. The entry point is `index.html` → root `main.jsx` → **`src/App.jsx`**. The old root `App.jsx` is not the active application.

## Enable AI replies

1. Copy `.env.example` to `.env` in this folder, or copy your existing private `.env` into this folder.
2. Set your own server-side Google Gemini key:

```dotenv
GEMINI_API_KEY=your_actual_key
GEMINI_MODEL=gemini-3.6-flash
```

3. Restart `npm run dev:all`. The API server is required only for live Gemini replies.
4. Open **Talk to Vex** or the floating **Ask Vex** robot and send a message.

The key never belongs in frontend JavaScript or a `VITE_` variable. Do not commit `.env`. Choose a Gemini model available to your account if the configured one is unavailable. Official API reference: https://ai.google.dev/api/generate-content

Without a key, Vex is an explicitly labelled **Website guide** with factual replies from the site's content. This local guide also works with `npm run dev` when the API server is unavailable. Provider outages or quota failures also show that fallback label. This is not a claim of live AI. The uploaded project contained no provider key, so live Gemini generation could not be verified; the request format, success/error handling and client UI were tested with a mocked provider, and the guide route was tested against the real local server.

Vex can explain services, projects, careers and contact options, and suggest next steps. It does not read private portal records, submit forms, send messages or modify website data. Its conversation follows SPA navigation and resets on a page reload. Voice replies use browser text-to-speech and microphone input uses browser speech recognition. Chrome or Edge is recommended. Browsers require the user to press the microphone or speaker control before audio can start.

## What changed

- **Premium website & Portal upgrade:** interactive project videos and before/after case-study sliders, cinematic route/scroll transitions, desktop cursor glow, 2–3 service comparison, planning configurator, favourites, and premium loading states.
- **Live lead operations:** contact enquiries and CV applications now flow into the Portal's new Leads workspace with unread bell alerts, status workflow, filters and CSV export. This local-first demo survives refresh through browser storage.
- **Installable and resilient:** PWA manifest, service worker caching, offline banner, direct-route refresh support, dynamic SEO metadata, sitemap, robots file and route-level code splitting are included.
- **Accessible controls:** public and Portal controls include text sizing, high contrast, reduced motion, keyboard focus and mobile-safe layouts.
- **Security baseline:** protected Portal routing, server sessions/API authentication support, strict upload validation, API rate limits and security headers are present. Replace local demo authentication with your production identity provider before handling real private data.

- **Circular gallery:** rebuilt as a complete rotating 3D cylinder with 16 service, project and approach cards, following the supplied circular-slider video. Drag, previous/next, keyboard arrows, pause/play and reduced-motion support are included. On phones the ring scales to fit; the selected item also appears as a readable link below it.
- **Login boxes:** corrected the broad span selector that forced description text into 44px icon boxes. All three icon/title/description blocks now fit their own responsive cards.
- **One Vex assistant:** the hero's 3D robot and the floating robot across routes open the same chat. Vex accepts microphone input, speaks replies, supports selectable browser voices and speed, understands common Roman Urdu requests, recommends services, explains planning budget ranges, and opens Services, Projects, Contact, Careers, Home or FAQ from spoken/text commands. Chat and voice preferences survive refresh. Animated eyes, thinking/speaking states, stop/retry behavior and navigation shortcuts are connected.
- **Server-side Gemini integration:** shared local/serverless chat handler with actual site knowledge, bounded history, request validation, timeout, per-process burst protection and explicit guide fallback. Health checks now report the Gemini configuration.
- **Portal and refresh:** repaired the Portal Copilot so it opens as a contained floating panel, made its refresh button re-read current candidate/task/progress data, and preserved the selected portal tab and Copilot conversation across page refreshes. Production now serves direct SPA route refreshes such as `/portal`.
- **Visual refinements:** scoped carousel/chat styles, consistent cyan/silver accents, corrected floating control positions, mobile layouts and accessible keyboard focus. Existing glow-ring treatments and robot wave/pause controls are retained.

## Main files

| File | Purpose |
| --- | --- |
| `src/components/CircularCardSlider.jsx` | Cylindrical carousel, interaction and animation |
| `src/components/VexAssistant.jsx` | Shared robot chat and voice UI |
| `src/components/vex-context.js` | Shared assistant connection |
| `src/components/RobotHero.jsx` | Visible 3D hero robot and chat entry |
| `src/components/canvas/TrackingRobot.jsx` | Robot geometry and motion |
| `src/styles/virexo-experience.scss` | Carousel, login, chat and responsive styling |
| `src/hooks/useMotionPreference.js` | User/system reduced-motion preference |
| `api/ai.js`, `api/chat.js`, `server.js` | Gemini request, knowledge, validation and API integration |

## Verification and limits

```bash
npm run test:ai
npm run build
```

Five backend tests cover validation, no-key fallback, mocked Gemini success, provider failures and rate limits. Chromium checks cover login text containment at 360/768/1440px; carousel layouts at 390/768/1024px; next/previous/pause and reduced motion; real guide responses; mocked AI success and HTTP 429 behavior; mobile chat; keyboard focus; and chat history across navigation; plus Portal layout/refresh at desktop and mobile sizes. No uncaught browser errors were observed in these checks. Production build passes with the existing large-chunk size warning; the WebGL robot remains lazy-loaded.

This is a source-code update, not a deployment. Preserve your original private configuration separately. Existing contact/newsletter flows and account/demo behavior are retained; this work does not add an email-delivery service or a production identity provider. The process-local chat limit should be supplemented by hosting-level limits for a public production deployment.

`node_modules`, old build output, `.git`, private `.env` files, runtime uploads and old nested ZIPs are excluded. Original public demo assets remain included. Run `npm ci` after extraction. Preview images in `preview/` show this version.
