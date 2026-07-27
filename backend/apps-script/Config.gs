/**
 * YveLeaf Backend — Configuration
 * Edit ADMIN_EMAILS before first deploy.
 */
var YVE_CONFIG = {
  ADMIN_EMAILS: ['codequeen.yvonne@gmail.com'],
  DRIVE_ROOT_FOLDER_NAME: 'YveLeaf',
  NOVELS_FOLDER_NAME: 'novels',
  APP_NAME: 'YveLeaf',
  SCHEMA_VERSION: 1,
};

/** Sheet tab names — do not rename after setup without updating code. */
var YVE_SHEETS = {
  NOVELS: 'Novels',
  USERS: 'Users',
  READING_PROGRESS: 'ReadingProgress',
  BOOKMARKS: 'Bookmarks',
  DAILY_READING_LOG: 'DailyReadingLog',
  USER_PREFERENCES: 'UserPreferences',
  SUMMARIES: 'Summaries',
  SCHEDULES: 'Schedules',
  SYNC_LOG: 'SyncLog',
  APP_CONFIG: 'AppConfig',
  ADMIN_AUDIT: 'AdminAuditLog',
};

/** Column schemas: header row for each sheet. */
var YVE_SCHEMA = {
  Novels: [
    'novel_id', 'title', 'author', 'genre', 'description', 'publication_year',
    'access_level', 'status', 'featured', 'sort_order',
    'pdf_drive_id', 'cover_drive_id', 'gallery_drive_ids',
    'total_pages', 'created_at', 'updated_at', 'published_at',
  ],
  Users: [
    'user_id', 'email', 'display_name', 'photo_url', 'is_premium',
    'account_status', 'created_at', 'updated_at', 'last_login_at',
  ],
  ReadingProgress: [
    'progress_id', 'user_id', 'novel_id', 'current_page', 'total_pages',
    'progress_pct', 'reading_status', 'last_opened_at',
    'sync_status', 'record_version', 'created_at', 'updated_at', 'deleted_at',
  ],
  Bookmarks: [
    'bookmark_id', 'user_id', 'novel_id', 'page', 'label',
    'sync_status', 'record_version', 'created_at', 'updated_at', 'deleted_at',
  ],
  DailyReadingLog: [
    'log_id', 'user_id', 'log_date', 'pages_read', 'created_at', 'updated_at',
  ],
  UserPreferences: [
    'user_id', 'default_reading_style', 'page_sound', 'gentle_vibration',
    'daily_page_goal', 'cloud_backup_enabled', 'updated_at',
  ],
  Summaries: [
    'summary_id', 'user_id', 'novel_id', 'content',
    'sync_status', 'record_version', 'created_at', 'updated_at', 'deleted_at',
  ],
  Schedules: [
    'schedule_id', 'user_id', 'novel_id', 'target_pages_per_day',
    'finish_by_date', 'reminder_enabled', 'reminder_time',
    'sync_status', 'record_version', 'created_at', 'updated_at', 'deleted_at',
  ],
  SyncLog: [
    'sync_id', 'user_id', 'device_id', 'action', 'record_type', 'record_id',
    'status', 'message', 'created_at',
  ],
  AppConfig: ['config_key', 'config_value', 'updated_at'],
  AdminAuditLog: ['audit_id', 'admin_email', 'action', 'details', 'created_at'],
};
