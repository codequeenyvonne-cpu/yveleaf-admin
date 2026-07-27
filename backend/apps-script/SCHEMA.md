# YveLeaf Cloud Database Schema

Google Sheets = database. Google Drive = file storage.

## Admin manages (via admin portal)

### Novels
| Column | Values / notes |
|--------|----------------|
| access_level | `offline` · `online` · `premium` |
| status | `draft` · `published` · `archived` |
| featured | TRUE / FALSE — home carousel |
| pdf_drive_id, cover_drive_id | Drive file IDs |
| gallery_drive_ids | comma-separated Drive IDs |

### Users (auto-created when readers sign in)
| Column | Notes |
|--------|-------|
| is_premium | Admin can toggle for premium novels |
| account_status | `active` · `suspended` |

## App syncs automatically (when reader signed in)

| Sheet | Mirrors phone SQLite |
|-------|---------------------|
| ReadingProgress | current page, %, status |
| Bookmarks | page + label per novel |
| DailyReadingLog | pages read per day (planner) |
| UserPreferences | reading style, sound, daily goal |

## Future (schema ready)

| Sheet | Purpose |
|-------|---------|
| Summaries | Personal notes per novel |
| Schedules | Finish-by dates, reminders |
| SyncLog | Debug sync issues |
| AdminAuditLog | Admin action history |

## Never stored in cloud

- PIN / fingerprint / app lock settings
- Local PDF paths (only Drive IDs in cloud)

## Access rules

| access_level | Guest (no sign-in) | Signed-in | Premium user |
|--------------|-------------------|-----------|------------|
| offline | ✅ catalog + download | ✅ | ✅ |
| online | ❌ | ✅ | ✅ |
| premium | ❌ | ❌ | ✅ |
