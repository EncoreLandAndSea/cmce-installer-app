# CMCE Install Doc App

A rugged, mobile-first web app that guides CMCE installers through each required documentation photo and captures a final signed completion form — ensuring every install is fully documented and easy to review right from the field.

---

## Features

- Step-by-step photo documentation checklist
- Camera capture with image compression & rotation
- Additional photos section for extra site evidence
- OHM and milliamp reading entry
- Primary down conductor size field
- Digital signature capture
- Installer certification checkbox
- Client-side PDF report generation (jsPDF — no server required)
- Export PDF or print summary on completion
- Fully offline-capable — all data stored in browser localStorage/sessionStorage

---

## Tech Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** for styling
- **Zustand** for state management (persisted to localStorage)
- **jsPDF** for client-side PDF generation
- **react-signature-canvas** for digital signatures
- **@tanstack/react-router** for routing
- **sessionStorage** for photo/signature data (cleared on job reset to save space)

---

## Self-Hosting

This app is fully self-contained. It has **no external service dependencies** — no database, no authentication, no cloud storage, no email sending. Everything runs in the browser.

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Configure environment (optional)

Copy `.env.example` to `.env.local`. No values are required for the app to run — the file is only needed if you add future integrations.

```bash
cp .env.example .env.local
```

### 3. Run locally

```bash
npm run dev
# or
bun dev
```

### 4. Build for production

```bash
npm run build
# or
bun run build
```

The output is in the `dist/` folder — a standard static site. Deploy it to any static host:

| Host | Command / Notes |
|------|-----------------|
| **Netlify** | Drag & drop `dist/` or connect repo. Build command: `npm run build`. Publish dir: `dist`. |
| **Vercel** | Import repo. Framework: Vite. Build command: `npm run build`. Output dir: `dist`. |
| **Cloudflare Pages** | Connect repo. Build command: `npm run build`. Output dir: `dist`. |
| **GitHub Pages** | Use `gh-pages` package or GitHub Actions to deploy `dist/`. |
| **Any web server** | Serve the `dist/` folder as a static site. Ensure your server redirects all routes to `index.html` for client-side routing. |

### Redirect rule for client-side routing

If you use Nginx or Apache, add a fallback redirect so deep links work:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache `.htaccess`:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

The `public/_redirects` file already handles this for **Netlify**:
```
/* /index.html 200
```

---

## PDF Reports

Reports are generated entirely in the browser using **jsPDF**. No server is involved.

On the Installation Complete screen, the installer can:
- **Export PDF** — downloads the full report with photos, readings, and signature
- **Print Summary** — opens the browser print dialog

The PDF should then be manually emailed or saved to the project file.

---

## Data Storage

| Data | Storage | Notes |
|------|---------|-------|
| Job details, checklist progress | `localStorage` | Persists across sessions |
| Step photos, additional photos, signature | `sessionStorage` | Cleared when browser tab closes |
| Completed job history | `localStorage` | Retained for reference |

Photos are compressed to max 1024×1024px at 72% JPEG quality before saving, keeping storage usage low.

---

## Project Structure

```
src/
├── lib/
│   ├── report.ts       # PDF generation (jsPDF)
│   ├── imageStore.ts   # Photo compression + sessionStorage helpers
│   └── utils.ts        # Tailwind class merge utility
├── pages/
│   ├── Home.tsx        # Dashboard / start screen
│   ├── NewJob.tsx      # New installation form
│   ├── Checklist.tsx   # Step checklist overview
│   ├── Step.tsx        # Individual photo step
│   ├── AdditionalPhotos.tsx
│   ├── Review.tsx      # Pre-submission review
│   ├── Signature.tsx   # Digital signature + certification
│   └── Success.tsx     # Completion screen + PDF export
├── store.ts            # Zustand state (job data, steps, history)
└── App.tsx             # Router setup
```

---

## Customisation

### Change the CMCE model options
Edit the `<select>` in `src/pages/NewJob.tsx`.

### Change the documentation steps
Edit the `INITIAL_STEPS` array in `src/store.ts`.

### Change branding / logo
Replace the logo URL in `src/App.tsx` (header) and `src/pages/Home.tsx` (empty state).

### Change the certification statement
Update the text in `src/pages/Signature.tsx` and `src/lib/report.ts`.
