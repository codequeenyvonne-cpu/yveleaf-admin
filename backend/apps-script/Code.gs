/**
 * YveLeaf Backend — paste into Google Apps Script (bound to your Sheet).
 * Deploy: Deploy → New deployment → Web app → Execute as Me → Anyone.
 */

const ADMIN_EMAILS = ['codequeen.yvonne@gmail.com'];
const SHEET_NOVELS = 'Novels';

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    const action = (e.parameter.action || '').trim();
    const body = method === 'POST' && e.postData ? JSON.parse(e.postData.contents) : {};

    if (action === 'catalog') {
      return jsonOk({ novels: listPublishedNovels_(e.parameter.access || 'public') });
    }

    if (action.startsWith('admin_')) {
      const token = getBearerToken_(e);
      const email = verifyGoogleIdToken_(token);
      assertAdmin_(email);

      switch (action) {
        case 'admin_verify':
          return jsonOk({ ok: true, email: email });
        case 'admin_novels':
          return jsonOk({ novels: listAllNovels_() });
        case 'admin_save_novel':
          return jsonOk({ novel: saveNovel_(body) });
        case 'admin_archive_novel':
          archiveNovel_(body.novel_id);
          return jsonOk({ ok: true });
        default:
          throw new Error('Unknown admin action');
      }
    }

    throw new Error('Unknown action');
  } catch (err) {
    return jsonError(err.message || String(err));
  }
}

function getBearerToken_(e) {
  const headers = e.headers || {};
  const auth = headers.Authorization || headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) throw new Error('Missing authorization token');
  return match[1];
}

function verifyGoogleIdToken_(token) {
  const resp = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
  );
  const data = JSON.parse(resp.getContentText());
  if (!data.email) throw new Error('Invalid Google token');
  return data.email;
}

function assertAdmin_(email) {
  if (ADMIN_EMAILS.indexOf(email) === -1) {
    throw new Error('You are not an admin');
  }
}

function novelsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NOVELS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NOVELS);
    sheet.appendRow([
      'novel_id', 'title', 'author', 'genre', 'description', 'access_level', 'status',
      'featured', 'sort_order', 'pdf_drive_id', 'cover_drive_id', 'gallery_drive_ids',
      'total_pages', 'updated_at',
    ]);
  }
  return sheet;
}

function rowsToNovels_(values) {
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i] ?? '';
    });
    obj.featured = obj.featured === true || obj.featured === 'TRUE' || obj.featured === 1 || obj.featured === '1';
    obj.sort_order = Number(obj.sort_order || 0);
    obj.total_pages = Number(obj.total_pages || 0);
    return obj;
  });
}

function listAllNovels_() {
  const values = novelsSheet_().getDataRange().getValues();
  return rowsToNovels_(values).filter(function (n) {
    return n.status !== 'archived';
  });
}

function listPublishedNovels_(access) {
  return listAllNovels_().filter(function (n) {
    if (n.status !== 'published') return false;
    if (access === 'all') return true;
    if (access === 'public') return n.access_level === 'offline';
    return n.access_level === access;
  });
}

function saveNovel_(payload) {
  const sheet = novelsSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const now = new Date().toISOString();
  let novelId = payload.novel_id;

  if (!novelId) {
    novelId = 'nvl_' + Utilities.getUuid().slice(0, 8);
  }

  const rowObj = {
    novel_id: novelId,
    title: payload.title || '',
    author: payload.author || '',
    genre: payload.genre || '',
    description: payload.description || '',
    access_level: payload.access_level || 'offline',
    status: payload.status || 'draft',
    featured: !!payload.featured,
    sort_order: Number(payload.sort_order || 0),
    pdf_drive_id: payload.pdf_drive_id || '',
    cover_drive_id: payload.cover_drive_id || '',
    gallery_drive_ids: payload.gallery_drive_ids || '',
    total_pages: Number(payload.total_pages || 0),
    updated_at: now,
  };

  let rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === novelId) {
      rowIndex = i + 1;
      break;
    }
  }

  const row = headers.map(function (h) {
    return rowObj[h] ?? '';
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return rowObj;
}

function archiveNovel_(novelId) {
  const sheet = novelsSheet_();
  const values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === novelId) {
      const statusCol = values[0].indexOf('status') + 1;
      const updatedCol = values[0].indexOf('updated_at') + 1;
      sheet.getRange(i + 1, statusCol).setValue('archived');
      sheet.getRange(i + 1, updatedCol).setValue(new Date().toISOString());
      return;
    }
  }
  throw new Error('Novel not found');
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
