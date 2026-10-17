# Harsh Thaker — Product portfolio

A responsive portfolio showcasing product ownership across survey, auditing, and operations workflows. Built with HTML, CSS, and JavaScript, with no framework or build dependencies.

## Features

- Light and dark themes with a saved preference
- Responsive desktop and mobile layouts
- Product stories and experience filters
- An illustrative survey interaction with answer retention
- Email, LinkedIn, and GitHub links
- Planned sections for case studies, writing, and a PM simulator

## Local preview

Open `dist/index.html` in a browser, or use VS Code's Live Server extension to serve the `dist` directory. No package installation or build command is required.

## Deploy to Vercel

1. In Vercel, select **Add New → Project** and import `harshT1818/portfolio`.
2. Keep **Root Directory** at the repository root.
3. Confirm these settings, supplied by `vercel.json`:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Output Directory | `dist` |
| Build Command | Empty |
| Install Command | Empty |
| Environment variables | None required |

4. Click **Deploy**. Push updates to the connected production branch to deploy subsequent changes.

Alternatively, run `npx vercel@latest` from the repository root for a preview deployment, then `npx vercel@latest --prod` for production. Choose the intended account and project when prompted.

[Vercel configuration documentation](https://vercel.com/docs/project-configuration/vercel-json)

## Editing

```text
dist/
  index.html    Page content and contact links
  styles.css    Layout, responsive styles, and theme tokens
  app.js        Product stories and interactions
vercel.json     Static deployment configuration
```

Place future images and a resume PDF inside `dist/` and link them from the page. Add verified metrics with their reporting periods and definitions when available. Future projects are labeled as planned until implemented.

Google Fonts supplies the display fonts, with system fallbacks. Theme preference is stored in the visitor's browser. Survey responses remain in memory and reset on reload. The site has no backend or analytics.
