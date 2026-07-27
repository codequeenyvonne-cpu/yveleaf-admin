/**
 * Creates the full YveLeaf Google Sheets database.
 * RUN ONCE: select setupYveLeafDatabase → Run
 */
function setupYveLeafDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('YveLeaf Database');

  var sheetMap = {
    Novels: YVE_SHEETS.NOVELS,
    Users: YVE_SHEETS.USERS,
    ReadingProgress: YVE_SHEETS.READING_PROGRESS,
    Bookmarks: YVE_SHEETS.BOOKMARKS,
    DailyReadingLog: YVE_SHEETS.DAILY_READING_LOG,
    UserPreferences: YVE_SHEETS.USER_PREFERENCES,
    Summaries: YVE_SHEETS.SUMMARIES,
    Schedules: YVE_SHEETS.SCHEDULES,
    SyncLog: YVE_SHEETS.SYNC_LOG,
    AppConfig: YVE_SHEETS.APP_CONFIG,
    AdminAuditLog: YVE_SHEETS.ADMIN_AUDIT,
  };

  Object.keys(YVE_SCHEMA).forEach(function (key) {
    ensureSheetWithHeaders_(ss, sheetMap[key], YVE_SCHEMA[key]);
  });

  seedAppConfig_();
  removeDefaultSheetIfEmpty_(ss);
  ensureDriveFolders_();

  Logger.log('YveLeaf database setup complete.');
  Logger.log('Schema version: ' + YVE_CONFIG.SCHEMA_VERSION);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('YveLeaf')
    .addItem('Setup database (run once)', 'setupYveLeafDatabase')
    .addItem('Health check', 'healthCheckMenu')
    .addToUi();
}

function healthCheckMenu() {
  healthCheck();
  SpreadsheetApp.getUi().alert('YveLeaf: All database sheets are present.');
}

function healthCheck() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var missing = [];
  Object.keys(YVE_SHEETS).forEach(function (key) {
    if (!ss.getSheetByName(YVE_SHEETS[key])) missing.push(YVE_SHEETS[key]);
  });
  if (missing.length) {
    throw new Error('Missing sheets: ' + missing.join(', '));
  }
  return { ok: true, sheets: Object.keys(YVE_SHEETS).length, config: getAppConfig_() };
}

function ensureSheetWithHeaders_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  var existing = sheet.getDataRange().getValues();
  if (existing.length === 0 || !existing[0] || existing[0][0] === '') {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    mergeHeaders_(sheet, headers);
  }

  sheet.setFrozenRows(1);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1B4332');
  headerRange.setFontColor('#FBF6EA');
  sheet.autoResizeColumns(1, Math.min(headers.length, 26));
}

function mergeHeaders_(sheet, expectedHeaders) {
  var row1 = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  expectedHeaders.forEach(function (h) {
    if (row1.indexOf(h) === -1) {
      var col = sheet.getLastColumn() + 1;
      sheet.getRange(1, col).setValue(h);
    }
  });
}

function seedAppConfig_() {
  var sheet = getSheet_(YVE_SHEETS.APP_CONFIG);
  var values = sheet.getDataRange().getValues();
  var existing = {};
  for (var i = 1; i < values.length; i++) existing[values[i][0]] = true;

  var now = isoNow_();
  [
    ['schema_version', String(YVE_CONFIG.SCHEMA_VERSION), now],
    ['min_app_version', '1.0.0', now],
    ['maintenance_mode', 'false', now],
    ['catalog_version', '1', now],
    ['public_message', 'Welcome to YveLeaf', now],
  ].forEach(function (row) {
    if (!existing[row[0]]) sheet.appendRow(row);
  });
}

function removeDefaultSheetIfEmpty_(ss) {
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() <= 1) {
    ss.deleteSheet(defaultSheet);
  }
}

function ensureDriveFolders_() {
  try {
    var root = findOrCreateFolder_(DriveApp.getRootFolder(), YVE_CONFIG.DRIVE_ROOT_FOLDER_NAME);
    findOrCreateFolder_(root, YVE_CONFIG.NOVELS_FOLDER_NAME);
    Logger.log('Drive folder ready: ' + root.getName());
  } catch (e) {
    Logger.log('Drive setup note: ' + e.message);
  }
}

function findOrCreateFolder_(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}
