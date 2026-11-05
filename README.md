# Ahmed Jawad — Portfolio

Vue 3 + TypeScript (strict) + Tailwind CSS v4, with motion-v, GSAP ScrollTrigger and Lenis.

```bash
npm i
npm run dev      # http://localhost:5173
npm run build    # type-check + production build → dist/
```

## Edit your content — `src/data/profile.ts`

Everything on the page reads from this one typed file (`Profile`, `Experience`, `Project`, `Skill`).

- **Live counter** — `startDate` drives "days as a programmer" and the months/years stat.
- **Projects** — add an object to `projects`. Put screenshots in `public/projects/` and set `image: '/projects/name.webp'`. Without an image, a typographic cover is drawn.
- **Links** — `linkedin` and project `link` are `null` until you fill them; the UI hides empty links.
- **GitHub** — `githubUsername` feeds the heatmap and stats.
- **CV** — replace `public/cv.pdf`.
- Search for `TODO` to find the gaps.

## Change the look — `src/styles/main.css`

- **Accent**: change `--accent` (fills) and `--accent-ink` (accent as text) in both the dark and light blocks, plus `--heat-1…4` for the GitHub grid.
- **Fonts**: swap the Google Fonts URL in `index.html` and `--font-display` / `--font-sans` / `--font-mono` in `@theme static`.
- **Easing**: `--ease-out` and `--ease-in-out` are used everywhere.

## Deploy

**Vercel** — import the repo; framework preset *Vite*, build `npm run build`, output `dist`.
**Netlify** — build command `npm run build`, publish directory `dist`.

Then set `og:url` in `index.html` to your domain.

## Structure

```
src/
  components/   reusable pieces (SplitText, MagneticButton, TerminalWindow, GithubHeatmap, ProjectDetail…)
  sections/     page sections in order
  composables/  useLenis, useCountUp, useReducedMotion, useGithubContributions, useTheme, useActiveSection
  directives/   v-reveal (RevealOnScroll)
  data/         profile.ts
  styles/       main.css (tokens + visual direction note)
```

## Motion & accessibility notes

- Only `transform`, `opacity`, `clip-path` and `filter: blur(≤4px)` animate.
- `prefers-reduced-motion`: no preloader, no Lenis, no scroll scenes, instant terminal, static marquee.
- Hidden "before reveal" states only exist when JS runs (`.js` on `<html>`).
- Terminal, palette (⌘K / Ctrl+K), mobile menu and project view are fully keyboard-operable.
