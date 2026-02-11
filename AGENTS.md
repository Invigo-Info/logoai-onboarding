# Repository Guidelines

## Project Structure & Module Organization

Logo.ai runs on Next.js 14 App Router. All marketing copy and hero data live in `app/page.tsx` as uppercase config objects such as `HERO` and `WHAT_YOU_GET`, while shared chrome sits in `app/layout.tsx` and `app/globals.css`. Add self-contained UI elements under `components/` and import them into the page. Static assets, including the replaceable `public/brand-kit.png` illustration and font files, belong in `public/`. Project level config lives in `next.config.js`, `tsconfig.json`, and `next-env.d.ts`.

## Build, Test, and Development Commands

- `npm install`: install dependencies defined in `package.json`.
- `npm run dev`: start the Next dev server at http://localhost:3000 for live editing.
- `npm run build`: produce the optimized production build; run before every PR to catch type or route errors.
- `npm start`: serve the output of `npm run build` locally to verify deployment behavior.

## Coding Style & Naming Conventions

Use TypeScript React function components and keep logic declarative. Follow the existing two space indentation, trailing commas in multi-line objects, and prefer double quotes to align with `app/page.tsx`. Store user facing copy inside the exported content objects so marketing edits stay centralized. Use `const` for component level data, camelCase for variables, PascalCase for components, and SCSS style custom properties defined in `app/globals.css`. When adding CSS modules, colocate them with the component or extend `globals.css` if the styles are shared.

## Testing Guidelines

Automated tests are not configured yet, so add them alongside new logic. Use React Testing Library plus Vitest or Jest for component coverage (aim for 80 percent on interactive bits) and keep files next to the feature as `ComponentName.test.tsx`. Mock fetch calls in `SignupForm` so tests do not hit external APIs. For end to end validation, prefer Playwright specs stored in `tests/` and run them against `npm run dev`. Until suites exist, smoke test every change by loading `npm run dev` and confirming hero copy, countdown timers, and the email form still behave.

## Commit & Pull Request Guidelines

Write imperative, scope-prefixed commits (for example `feat: refresh hero gradient` or `fix: gate countdown timer`). Keep the first line under 72 characters and include context in the body when touching multiple areas. Pull requests should summarize the change, link the tracking issue or task, and note any configuration updates such as new environment variables for the sign up integration. Attach before and after screenshots for visual updates and mention manual verification steps (dev server, production build) so reviewers can reproduce them quickly.

## Security & Configuration Tips

Never commit API credentials; store provider keys for the signup API in `.env.local` and read them via `process.env` with proper `NEXT_PUBLIC_` prefixes when exposing to the client. Sanitize any user input inside `SignupForm` before sending it to third party services. When updating fonts or static artwork, ensure files land in `public/` and confirm the import paths in `app/layout.tsx` or CSS. Run `npm run build` before deploying to confirm the bundle does not include accidental secrets or unused imports.
