/**
 * Novels — admin + public catalog
 */

function listAllNovels_() {
  var rows = rowsToObjects_(getSheet_(YVE_SHEETS.NOVELS).getDataRange().getValues());
  return rows.filter(function (n) { return n.status !== 'archived'; });
}

function listPublishedNovels_(access, user) {
  return listAllNovels_().filter(function (n) {
    if (n.status !== 'published') return false;
    if (access === 'admin') return true;
    if (access === 'all' && user) return userCanAccessNovel_(user, n);
    if (access === 'public' || !user) return n.access_level === 'offline';
    return userCanAccessNovel_(user, n);
  }).sort(function (a, b) {
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });
}

function enrichNovelForApp_(novel, includeUrls) {
  var copy = JSON.parse(JSON.stringify(novel));
  if (includeUrls) {
    copy.pdf_download_url = getDriveDownloadUrl_(novel.pdf_drive_id);
    copy.cover_download_url = getDriveDownloadUrl_(novel.cover_drive_id);
  }
  return copy;
}

function getNovelById_(novelId) {
  var rows = listAllNovels_();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].novel_id === novelId) return rows[i];
  }
  return null;
}

function saveNovel_(payload, adminEmail) {
  var now = isoNow_();
  var novelId = payload.novel_id || newId_('nvl');
  var existing = getNovelById_(novelId);

  var row = {
    novel_id: novelId,
    title: payload.title || '',
    author: payload.author || '',
    genre: payload.genre || '',
    description: payload.description || '',
    publication_year: payload.publication_year || '',
    access_level: payload.access_level || 'offline',
    status: payload.status || 'draft',
    featured: !!payload.featured,
    sort_order: Number(payload.sort_order || 0),
    pdf_drive_id: payload.pdf_drive_id || '',
    cover_drive_id: payload.cover_drive_id || '',
    gallery_drive_ids: payload.gallery_drive_ids || '',
    total_pages: Number(payload.total_pages || 0),
    created_at: existing ? existing.created_at : now,
    updated_at: now,
    published_at: payload.status === 'published'
      ? (existing && existing.published_at ? existing.published_at : now)
      : (existing ? existing.published_at : ''),
  };

  upsertRow_(YVE_SHEETS.NOVELS, 'novel_id', novelId, row);
  logAdminAction_(adminEmail, 'save_novel', { novel_id: novelId, title: row.title });
  return row;
}

function archiveNovel_(novelId, adminEmail) {
  var sheet = getSheet_(YVE_SHEETS.NOVELS);
  var found = findRowIndex_(sheet, 'novel_id', novelId);
  if (!found) throw new Error('Novel not found');

  var now = isoNow_();
  sheet.getRange(found.rowIndex, found.headers.indexOf('status') + 1).setValue('archived');
  sheet.getRange(found.rowIndex, found.headers.indexOf('updated_at') + 1).setValue(now);
  logAdminAction_(adminEmail, 'archive_novel', { novel_id: novelId });
}

function adminListUsers_() {
  return rowsToObjects_(getSheet_(YVE_SHEETS.USERS).getDataRange().getValues());
}

function adminSetUserPremium_(userId, isPremium, adminEmail) {
  var sheet = getSheet_(YVE_SHEETS.USERS);
  var found = findRowIndex_(sheet, 'user_id', userId);
  if (!found) throw new Error('User not found');

  sheet.getRange(found.rowIndex, found.headers.indexOf('is_premium') + 1).setValue(!!isPremium);
  sheet.getRange(found.rowIndex, found.headers.indexOf('updated_at') + 1).setValue(isoNow_());
  logAdminAction_(adminEmail, 'set_premium', { user_id: userId, is_premium: !!isPremium });
}
