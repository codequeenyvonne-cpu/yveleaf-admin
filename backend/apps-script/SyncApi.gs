/**
 * User sync — reading progress, bookmarks, daily log, preferences
 * Used by Flutter app when signed in (Phase 2).
 */

function syncPullAll_(userId) {
  return {
    progress: listUserProgress_(userId),
    bookmarks: listUserBookmarks_(userId),
    daily_log: listUserDailyLog_(userId),
    preferences: getUserPreferences_(userId),
  };
}

function listUserProgress_(userId) {
  return rowsToObjects_(getSheet_(YVE_SHEETS.READING_PROGRESS).getDataRange().getValues())
    .filter(function (r) { return r.user_id === userId && !r.deleted_at; });
}

function listUserBookmarks_(userId) {
  return rowsToObjects_(getSheet_(YVE_SHEETS.BOOKMARKS).getDataRange().getValues())
    .filter(function (r) { return r.user_id === userId && !r.deleted_at; });
}

function listUserDailyLog_(userId) {
  return rowsToObjects_(getSheet_(YVE_SHEETS.DAILY_READING_LOG).getDataRange().getValues())
    .filter(function (r) { return r.user_id === userId; });
}

function getUserPreferences_(userId) {
  var rows = rowsToObjects_(getSheet_(YVE_SHEETS.USER_PREFERENCES).getDataRange().getValues());
  return rows.filter(function (r) { return r.user_id === userId; })[0] || null;
}

function saveReadingProgress_(userId, payload) {
  var now = isoNow_();
  var progressId = payload.progress_id || newId_('prg');
  var total = Number(payload.total_pages || 0);
  var current = Number(payload.current_page || 0);
  var pct = total > 0 ? current / total : 0;

  var row = {
    progress_id: progressId,
    user_id: userId,
    novel_id: payload.novel_id,
    current_page: current,
    total_pages: total,
    progress_pct: pct,
    reading_status: pct >= 1 ? 'completed' : 'reading',
    last_opened_at: now,
    sync_status: 'synchronized',
    record_version: Number(payload.record_version || 0) + 1,
    created_at: payload.created_at || now,
    updated_at: now,
    deleted_at: '',
  };

  upsertRow_(YVE_SHEETS.READING_PROGRESS, 'progress_id', progressId, row);
  return row;
}

function saveBookmark_(userId, payload) {
  var now = isoNow_();
  var bookmarkId = payload.bookmark_id || newId_('bmk');
  var row = {
    bookmark_id: bookmarkId,
    user_id: userId,
    novel_id: payload.novel_id,
    page: Number(payload.page || 0),
    label: payload.label || '',
    sync_status: 'synchronized',
    record_version: Number(payload.record_version || 0) + 1,
    created_at: payload.created_at || now,
    updated_at: now,
    deleted_at: '',
  };
  upsertRow_(YVE_SHEETS.BOOKMARKS, 'bookmark_id', bookmarkId, row);
  return row;
}

function deleteBookmark_(userId, bookmarkId) {
  var rows = rowsToObjects_(getSheet_(YVE_SHEETS.BOOKMARKS).getDataRange().getValues());
  var bm = rows.filter(function (r) {
    return r.bookmark_id === bookmarkId && r.user_id === userId;
  })[0];
  if (!bm) throw new Error('Bookmark not found');
  softDeleteRow_(YVE_SHEETS.BOOKMARKS, 'bookmark_id', bookmarkId);
}

function addDailyPages_(userId, logDate, pages) {
  var sheet = getSheet_(YVE_SHEETS.DAILY_READING_LOG);
  var rows = rowsToObjects_(sheet.getDataRange().getValues());
  var existing = rows.filter(function (r) {
    return r.user_id === userId && r.log_date === logDate;
  })[0];

  var now = isoNow_();
  if (existing) {
    var updated = {
      log_id: existing.log_id,
      user_id: userId,
      log_date: logDate,
      pages_read: Number(existing.pages_read || 0) + Number(pages || 0),
      created_at: existing.created_at,
      updated_at: now,
    };
    upsertRow_(YVE_SHEETS.DAILY_READING_LOG, 'log_id', existing.log_id, updated);
    return updated;
  }

  var row = {
    log_id: newId_('log'),
    user_id: userId,
    log_date: logDate,
    pages_read: Number(pages || 0),
    created_at: now,
    updated_at: now,
  };
  upsertRow_(YVE_SHEETS.DAILY_READING_LOG, 'log_id', row.log_id, row);
  return row;
}

function saveUserPreferences_(userId, payload) {
  var now = isoNow_();
  var row = {
    user_id: userId,
    default_reading_style: Number(payload.default_reading_style ?? 0),
    page_sound: payload.page_sound !== false,
    gentle_vibration: payload.gentle_vibration !== false,
    daily_page_goal: Number(payload.daily_page_goal || 20),
    cloud_backup_enabled: !!payload.cloud_backup_enabled,
    updated_at: now,
  };
  upsertRow_(YVE_SHEETS.USER_PREFERENCES, 'user_id', userId, row);
  return row;
}

function syncPushBatch_(userId, deviceId, payload) {
  var results = { progress: [], bookmarks: [], daily_log: [], preferences: null };

  (payload.progress || []).forEach(function (item) {
    results.progress.push(saveReadingProgress_(userId, item));
  });
  (payload.bookmarks || []).forEach(function (item) {
    if (item.deleted) deleteBookmark_(userId, item.bookmark_id);
    else results.bookmarks.push(saveBookmark_(userId, item));
  });
  (payload.daily_log || []).forEach(function (item) {
    results.daily_log.push(addDailyPages_(userId, item.log_date, item.pages_read));
  });
  if (payload.preferences) {
    results.preferences = saveUserPreferences_(userId, payload.preferences);
  }

  logSync_(userId, deviceId, 'sync_push', 'batch', '', 'ok', 'Batch sync complete');
  return results;
}
