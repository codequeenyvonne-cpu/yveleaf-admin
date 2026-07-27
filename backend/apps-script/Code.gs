/**
 * YveLeaf Backend — HTTP entry point
 * Deploy as Web App: Execute as Me, Anyone
 */

function doGet(e) {
  return handleRequest_(e || {}, 'GET', {});
}

function doPost(e) {
  var body = {};
  try {
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (err) {
    return jsonError('Invalid JSON body');
  }
  return handleRequest_(e || {}, 'POST', body);
}

function handleRequest_(e, method, body) {
  try {
    var action = String((e.parameter && e.parameter.action) || body.action || '').trim();
    if (!action) throw new Error('Missing action parameter');

    if (action === 'health') {
      return jsonOk(healthCheck());
    }

    if (action === 'catalog') {
      var access = (e.parameter && e.parameter.access) || 'public';
      var novels = listPublishedNovels_(access, null).map(function (n) {
        return enrichNovelForApp_(n, true);
      });
      return jsonOk({ novels: novels, config: getAppConfig_() });
    }

    if (action === 'novel') {
      var novel = getNovelById_(e.parameter.novel_id || body.novel_id);
      if (!novel || novel.status !== 'published') throw new Error('Novel not found');
      return jsonOk({ novel: enrichNovelForApp_(novel, true) });
    }

    if (action === 'user_register') {
      var user = requireUser_(e, body);
      return jsonOk({ user: user });
    }

    if (action === 'user_catalog') {
      var appUser = requireUser_(e, body);
      var userNovels = listPublishedNovels_('all', appUser).map(function (n) {
        return enrichNovelForApp_(n, true);
      });
      return jsonOk({ novels: userNovels, user: appUser });
    }

    if (action === 'sync_pull') {
      var pullUser = requireUser_(e, body);
      return jsonOk(syncPullAll_(pullUser.user_id));
    }

    if (action === 'sync_push') {
      var pushUser = requireUser_(e, body);
      return jsonOk(syncPushBatch_(pushUser.user_id, body.device_id || '', body));
    }

    if (action.indexOf('admin_') === 0) {
      var admin = requireAdmin_(e, body);

      if (action === 'admin_verify') {
        return jsonOk({ ok: true, email: admin.email });
      }
      if (action === 'admin_novels') {
        return jsonOk({ novels: listAllNovels_() });
      }
      if (action === 'admin_save_novel') {
        return jsonOk({ novel: saveNovel_(body, admin.email) });
      }
      if (action === 'admin_archive_novel') {
        archiveNovel_(body.novel_id, admin.email);
        return jsonOk({ ok: true });
      }
      if (action === 'admin_users') {
        return jsonOk({ users: adminListUsers_() });
      }
      if (action === 'admin_set_premium') {
        adminSetUserPremium_(body.user_id, body.is_premium, admin.email);
        return jsonOk({ ok: true });
      }
      if (action === 'admin_stats') {
        return jsonOk({
          novels: listAllNovels_().length,
          published: listAllNovels_().filter(function (n) { return n.status === 'published'; }).length,
          users: adminListUsers_().length,
        });
      }
      throw new Error('Unknown admin action');
    }

    throw new Error('Unknown action: ' + action);
  } catch (err) {
    return jsonError(err.message || String(err));
  }
}
