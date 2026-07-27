# YveLeaf Google Backend — Setup Guide

Follow these steps **in order**. Use the Google account that will own everything: **codequeen.yvonne@gmail.com**.

---

## Part A — Create the Google Sheet (database)

1. Go to **https://sheets.google.com**
2. Click **Blank spreadsheet**
3. Name it: **YveLeaf Database**
4. Keep this tab open — Apps Script will attach to this file

---

## Part B — Create the Drive folder (PDFs & covers)

1. Go to **https://drive.google.com**
2. Click **New → Folder**
3. Name it: **YveLeaf**
4. Inside it, create subfolder: **novels**
5. Optional: inside `novels`, create one folder per book later (e.g. `nvl_001/`)

**Rule:** PDFs and images live in **Drive**. The Sheet stores **file IDs only**, never PDF bytes.

---

## Part C — Paste Apps Script code

1. In your **YveLeaf Database** sheet: **Extensions → Apps Script**
2. Delete any default code in `Code.gs`
3. Open these files from this repo and paste each as a **separate script file** in Apps Script:

| Paste into Apps Script file | Copy from repo |
|----------------------------|----------------|
| `Config.gs` | `backend/apps-script/Config.gs` |
| `DatabaseSetup.gs` | `backend/apps-script/DatabaseSetup.gs` |
| `SheetStore.gs` | `backend/apps-script/SheetStore.gs` |
| `Auth.gs` | `backend/apps-script/Auth.gs` |
| `NovelsApi.gs` | `backend/apps-script/NovelsApi.gs` |
| `UsersApi.gs` | `backend/apps-script/UsersApi.gs` |
| `SyncApi.gs` | `backend/apps-script/SyncApi.gs` |
| `Code.gs` | `backend/apps-script/Code.gs` |

4. In **`Config.gs`**, confirm:
   ```javascript
   ADMIN_EMAILS: ['codequeen.yvonne@gmail.com'],
   ```
5. Click **Save** (disk icon). Name the project: **YveLeaf Backend**

---

## Part D — Run database setup (creates all tables)

1. In Apps Script, open **`DatabaseSetup.gs`**
2. In the function dropdown (top toolbar), select **`setupYveLeafDatabase`**
3. Click **Run ▶**
4. First time: Google asks for permissions → **Review permissions → Advanced → Go to YveLeaf Backend (unsafe) → Allow**
5. When finished, open **View → Logs** — you should see: `YveLeaf database setup complete.`

6. Go back to your **Google Sheet** — you should now see **11 tabs**:

| Tab | Purpose |
|-----|---------|
| **Novels** | Books you publish (admin) |
| **Users** | Readers who sign in with Google |
| **ReadingProgress** | Page & % per user per novel |
| **Bookmarks** | Saved pages per user |
| **DailyReadingLog** | Pages read per day (planner/goals) |
| **UserPreferences** | Reading style, sound, daily goal (sync) |
| **Summaries** | Personal novel notes (future) |
| **Schedules** | Finish-by dates & reminders (future) |
| **SyncLog** | Sync audit trail |
| **AppConfig** | App version, maintenance mode |
| **AdminAuditLog** | What admins changed |

---

## Part E — Deploy as Web App (API URL)

1. Apps Script: **Deploy → New deployment**
2. Click gear ⚙ → **Web app**
3. Settings:
   - **Description:** YveLeaf API v1
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web app URL** — looks like:
   `https://script.google.com/macros/s/XXXXX/exec`

6. Save this URL — you will paste it in:
   - Admin portal → **Settings**
   - Flutter app (later)

---

## Part F — Google Cloud OAuth (admin sign-in)

1. Go to **https://console.cloud.google.com**
2. Create project: **YveLeaf**
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (or Internal if Workspace)
   - App name: **YveLeaf Admin**
   - Support email: your Gmail
   - Save
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Type: **Web application**
   - Name: **YveLeaf Admin Web**
   - Authorized JavaScript origins:
     - `https://codequeenyvonne-cpu.github.io`
     - `http://localhost:5173`
   - Create → copy **Client ID**
5. Paste Client ID in admin portal **Settings**

---

## Part G — Connect admin portal

1. Open **https://codequeenyvonne-cpu.github.io/yveleaf-admin/**
2. Go to **Settings**
3. Paste:
   - **Apps Script Web App URL** (from Part E)
   - **Google OAuth Client ID** (from Part F)
4. Save → go to **Login** → **Sign in with Google**

---

## Part H — Upload your first novel

1. Upload **book.pdf** and **cover.jpg** to Drive folder `YveLeaf/novels/`
2. For each file: right-click → **Share → Anyone with the link → Viewer**
3. Open file → copy **file ID** from URL:
   `https://drive.google.com/file/d/ **THIS_PART** /view`
4. Admin portal → **Novels → Add novel**
5. Fill title, author, Drive IDs, set **Access level**, **Status = published**
6. Save → row appears in **Novels** sheet

---

## Quick test URLs (after deploy)

Replace `YOUR_SCRIPT_URL` with your Web app URL:

- Public catalog: `YOUR_SCRIPT_URL?action=catalog&access=public`
- Health check: `YOUR_SCRIPT_URL?action=health`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "You are not an admin" | Check email in `Config.gs` matches your Google account |
| Admin sign-in fails | Add GitHub Pages URL to OAuth origins |
| Empty catalog | Set novel `status=published` in sheet |
| Permission denied on Run | Re-authorize Apps Script (Part D step 4) |

---

## What admin manages vs what syncs automatically

| Admin portal (you) | App sync (readers, later) |
|--------------------|---------------------------|
| Novels, access level, publish | Reading progress |
| Featured, Drive file IDs | Bookmarks |
| Draft / archived | Daily page counts |
| Premium flag on users (sheet) | User preferences |

PIN, fingerprint, and app lock **never** go to the cloud — they stay on the device only.
