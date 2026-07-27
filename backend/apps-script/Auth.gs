/**
 * Authentication
 */

function getBearerToken_(e, body) {
  var headers = e.headers || {};
  var auth = headers.Authorization || headers.authorization || '';
  var match = auth.match(/^Bearer\s+(.+)$/i);
  if (match) return match[1];
  if (body && body.token) return body.token;
  if (e.parameter && e.parameter.token) return e.parameter.token;
  throw new Error('Missing authorization token');
}

function verifyGoogleIdToken_(token) {
  var resp = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true },
  );
  if (resp.getResponseCode() !== 200) throw new Error('Invalid Google token');
  var data = JSON.parse(resp.getContentText());
  if (!data.email) throw new Error('Invalid Google token');
  return {
    email: data.email,
    sub: data.sub,
    name: data.name || '',
    picture: data.picture || '',
  };
}

function assertAdmin_(email) {
  if (YVE_CONFIG.ADMIN_EMAILS.indexOf(email) === -1) {
    throw new Error('You are not an admin');
  }
}

function requireAdmin_(e, body) {
  var profile = verifyGoogleIdToken_(getBearerToken_(e, body));
  assertAdmin_(profile.email);
  return profile;
}

function requireUser_(e, body) {
  var profile = verifyGoogleIdToken_(getBearerToken_(e, body));
  return upsertUserFromGoogle_(profile);
}

function upsertUserFromGoogle_(profile) {
  var now = isoNow_();
  var userId = 'usr_' + profile.sub;
  var sheet = getSheet_(YVE_SHEETS.USERS);
  var found = findRowIndex_(sheet, 'user_id', userId);

  var row = {
    user_id: userId,
    email: profile.email,
    display_name: profile.name || profile.email.split('@')[0],
    photo_url: profile.picture || '',
    is_premium: found ? found.values[found.rowIndex - 1][found.headers.indexOf('is_premium')] : false,
    account_status: 'active',
    updated_at: now,
    last_login_at: now,
    created_at: found ? found.values[found.rowIndex - 1][found.headers.indexOf('created_at')] : now,
  };

  upsertRow_(YVE_SHEETS.USERS, 'user_id', userId, row);
  return normalizeRow_(row);
}

function isUserPremium_(userId) {
  var rows = rowsToObjects_(getSheet_(YVE_SHEETS.USERS).getDataRange().getValues());
  var user = rows.filter(function (r) { return r.user_id === userId; })[0];
  return !!(user && user.is_premium);
}

function userCanAccessNovel_(user, novel) {
  if (novel.status !== 'published') return false;
  if (novel.access_level === 'offline' || novel.access_level === 'online') return true;
  if (novel.access_level === 'premium') return user && isUserPremium_(user.user_id);
  return false;
}
