/**
 * Sheet read/write helpers
 */

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(name) {
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet not found: ' + name + '. Run setupYveLeafDatabase first.');
  }
  return sheet;
}

function rowsToObjects_(values) {
  if (!values || values.length < 2) return [];
  var headers = values[0];
  return values.slice(1).filter(function (row) {
    return row.some(function (cell) { return cell !== '' && cell !== null; });
  }).map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] !== undefined && row[i] !== null ? row[i] : '';
    });
    return normalizeRow_(obj);
  });
}

function normalizeRow_(obj) {
  ['featured', 'is_premium', 'page_sound', 'gentle_vibration', 'cloud_backup_enabled', 'reminder_enabled'].forEach(function (key) {
    if (obj[key] !== undefined) {
      obj[key] = obj[key] === true || obj[key] === 'TRUE' || obj[key] === 1 || obj[key] === '1';
    }
  });
  ['sort_order', 'total_pages', 'current_page', 'progress_pct', 'pages_read', 'page', 'default_reading_style', 'daily_page_goal', 'target_pages_per_day', 'record_version'].forEach(function (key) {
    if (obj[key] !== undefined && obj[key] !== '') obj[key] = Number(obj[key]);
  });
  return obj;
}

function upsertRow_(sheetName, idColumn, idValue, rowObj) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) throw new Error('Sheet empty: ' + sheetName);

  var headers = values[0];
  var idIndex = headers.indexOf(idColumn);
  if (idIndex === -1) throw new Error('ID column missing: ' + idColumn);

  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      rowIndex = i + 1;
      break;
    }
  }

  var row = headers.map(function (h) {
    return rowObj[h] !== undefined ? rowObj[h] : '';
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, rowIndex, headers.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return rowObj;
}

function findRowIndex_(sheet, idColumn, idValue) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf(idColumn);
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(idValue)) {
      return { rowIndex: i + 1, headers: headers, values: values };
    }
  }
  return null;
}

function softDeleteRow_(sheetName, idColumn, idValue, statusField) {
  var sheet = getSheet_(sheetName);
  var found = findRowIndex_(sheet, idColumn, idValue);
  if (!found) throw new Error('Record not found');

  var now = isoNow_();
  var deletedCol = found.headers.indexOf('deleted_at') + 1;
  var updatedCol = found.headers.indexOf('updated_at') + 1;
  if (deletedCol > 0) sheet.getRange(found.rowIndex, deletedCol).setValue(now);
  if (updatedCol > 0) sheet.getRange(found.rowIndex, updatedCol).setValue(now);

  if (statusField) {
    var statusCol = found.headers.indexOf(statusField) + 1;
    if (statusCol > 0) sheet.getRange(found.rowIndex, statusCol).setValue('archived');
  }
}

function isoNow_() {
  return new Date().toISOString();
}

function newId_(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12);
}

function logAdminAction_(email, action, details) {
  getSheet_(YVE_SHEETS.ADMIN_AUDIT).appendRow([
    newId_('aud'), email, action, JSON.stringify(details || {}), isoNow_(),
  ]);
}

function logSync_(userId, deviceId, action, recordType, recordId, status, message) {
  getSheet_(YVE_SHEETS.SYNC_LOG).appendRow([
    newId_('syn'), userId || '', deviceId || '', action, recordType || '',
    recordId || '', status, message || '', isoNow_(),
  ]);
}

function getAppConfig_() {
  var rows = rowsToObjects_(getSheet_(YVE_SHEETS.APP_CONFIG).getDataRange().getValues());
  var cfg = {};
  rows.forEach(function (r) { cfg[r.config_key] = r.config_value; });
  return cfg;
}

function getDriveDownloadUrl_(fileId) {
  if (!fileId) return '';
  return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(fileId);
}

function jsonOk(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function jsonError(message) {
  return ContentService.createTextOutput(JSON.stringify({ error: message })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
