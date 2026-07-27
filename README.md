# YveLeaf Admin Portal

Modern web admin for managing YveLeaf novels. Hosted on **GitHub Pages**. Backend is **Google Apps Script + Google Sheets + Google Drive**.

## Live URL (after deploy)

`https://codequeenyvonne-cpu.github.io/yveleaf-admin/`

## Stack

- React + TypeScript + Vite + Tailwind CSS
- Google Sign-In (admin only)
- Apps Script JSON API

## Local development

```bash
npm install
npm run dev
```

## Environment (optional)

Copy `.env.example` to `.env.local`:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Or set these in **Settings** inside the admin UI.

## Google backend (local only — not in this repo)

Apps Script code lives on your computer in:

**`../App Script/`** (next to the `yveleaf-admin` folder)

1. Open **https://script.google.com** → New project
2. Paste all 7 `.gs` files from that folder
3. Run **`setupYveLeafEverything`** — creates Sheet + Drive automatically
4. **Deploy → Web app** → paste URL in admin **Settings**
5. Google Cloud Console → OAuth Web client → paste Client ID in **Settings**

See **`App Script/README.md`** for full steps.

## Push to GitHub

```bash
/usr/bin/gh auth login   # sign in as codequeenyvonne-cpu
git init
git add .
git commit -m "Initial YveLeaf admin portal"
gh repo create yveleaf-admin --public --source=. --push
```

Enable GitHub Pages: repo **Settings → Pages → Source: GitHub Actions**.

## Fix `gh` on Kali (snap conflict)

If `gh --version` shows a snap error, use the apt binary directly:

```bash
/usr/bin/gh --version
sudo snap remove gh
```

Or add to `~/.zshrc`:

```bash
alias gh='/usr/bin/gh'
```
