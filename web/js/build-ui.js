/**
 * Web Build — POST /api/build (Vercel) → owner GitHub Actions.
 * PAT stays in Vercel env only. History via /api/runs or public GitHub API.
 */

import { t } from './i18n.js';
import { showToast } from './toast.js';
import { esc } from './utils.js';
import { BUILD_CONFIG, DATA_FILES } from './config.js';

var kernelDataCache = {};
var pollTimer = null;

export function setKernelDataCache(datasets) {
  kernelDataCache = {};
  datasets.forEach(function (ds) {
    kernelDataCache[ds.meta.kernel] = ds.data || {};
  });
  refreshPatchOptions();
}

function $(id) {
  return document.getElementById(id);
}

function applyI18n() {
  var map = {
    buildPanelTitle: 'buildTitle',
    buildPanelDesc: 'buildDesc',
    buildHowTitle: 'buildHowTitle',
    buildKernelLabel: 'buildKernel',
    buildPatchLabel: 'buildPatch',
    buildVariantLabel: 'buildVariant',
    buildKittisuRepoLabel: 'buildKittisuRepo',
    buildKittisuBranchLabel: 'buildKittisuBranch',
    buildVersionLabel: 'buildVersionName',
    buildKpmLabel: 'buildKpm',
    buildSusfsLabel: 'buildSusfs',
    buildZramLabel: 'buildZram',
    buildBbgLabel: 'buildBbg',
    buildRekernelLabel: 'buildRekernel',
    buildArtifactLabel: 'buildArtifact',
    buildHistoryTitle: 'buildHistory',
    buildSubmit: 'buildSubmit',
    buildRefreshHistory: 'buildRefresh',
  };
  Object.keys(map).forEach(function (id) {
    var el = $(id);
    if (!el || t[map[id]] == null) return;
    if (el.tagName === 'BUTTON') el.textContent = t[map[id]];
    else el.textContent = t[map[id]];
  });
  var how = $('buildHowBody');
  if (how) how.innerHTML = t.buildHowHtml || '';
}

function refreshPatchOptions() {
  var kernelSel = $('buildKernel');
  var patchSel = $('buildPatch');
  if (!kernelSel || !patchSel) return;

  var data = kernelDataCache[kernelSel.value] || {};
  var entries = data.entries || [];
  var current = patchSel.value;
  patchSel.innerHTML = '';

  if (data.lts) {
    var o = document.createElement('option');
    o.value = 'lts';
    o.textContent = 'LTS — ' + data.lts;
    patchSel.appendChild(o);
  }
  for (var i = entries.length - 1; i >= 0; i--) {
    var e = entries[i];
    var opt = document.createElement('option');
    opt.value = e.date;
    opt.textContent = e.date + ' — ' + e.kernel;
    patchSel.appendChild(opt);
  }
  if (!entries.length && !data.lts) {
    var empty = document.createElement('option');
    empty.value = '';
    empty.textContent = t.buildNoPatches || '—';
    patchSel.appendChild(empty);
  }
  if (current) {
    for (var j = 0; j < patchSel.options.length; j++) {
      if (patchSel.options[j].value === current) {
        patchSel.selectedIndex = j;
        break;
      }
    }
  }
}

function collectInputs() {
  return {
    kernel_version: $('buildKernel').value,
    os_patch_level: $('buildPatch').value,
    kernelsu_variant: $('buildVariant').value,
    kittisu_repo: ($('buildKittisuRepo').value || BUILD_CONFIG.defaultKittisuRepo).trim(),
    kittisu_branch: ($('buildKittisuBranch').value || 'main').trim(),
    version: ($('buildVersionName').value || '').trim(),
    use_kpm: $('buildKpm').value,
    cancel_susfs: !$('buildSusfs').checked,
    use_zram: $('buildZram').checked,
    use_bbg: $('buildBbg').checked,
    use_rekernel: $('buildRekernel').checked,
    droidspaces: 'off',
    droidspaces_ntsync: false,
    supp_op: false,
    artifact_upload_mode: $('buildArtifact').value,
  };
}

function setStatus(msg, kind) {
  var el = $('buildStatus');
  if (!el) return;
  el.textContent = msg || '';
  el.className = 'build-status' + (kind ? ' build-status--' + kind : '');
}

function statusClass(status, conclusion) {
  if (status === 'completed') {
    if (conclusion === 'success') return 'run-ok';
    if (conclusion === 'cancelled') return 'run-muted';
    return 'run-fail';
  }
  if (status === 'in_progress' || status === 'queued' || status === 'waiting' || status === 'pending' || status === 'requested') {
    return 'run-busy';
  }
  return 'run-muted';
}

function statusLabel(status, conclusion) {
  if (status === 'completed') {
    if (conclusion === 'success') return t.buildStatusSuccess || 'Success';
    if (conclusion === 'cancelled') return t.buildStatusCancelled || 'Cancelled';
    return t.buildStatusFailed || 'Failed';
  }
  if (status === 'in_progress') return t.buildStatusRunning || 'Running';
  if (status === 'queued' || status === 'waiting' || status === 'pending' || status === 'requested') {
    return t.buildStatusQueued || 'Queued';
  }
  return status || '—';
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch (_) {
    return iso || '—';
  }
}

async function fetchRuns() {
  // Prefer same-origin API (uses owner PAT server-side for rate limit)
  try {
    var r = await fetch('/api/runs?per_page=20', { cache: 'no-store' });
    if (r.ok) {
      var data = await r.json();
      return data.runs || [];
    }
  } catch (_) {}

  // Fallback: public GitHub API
  var repo = BUILD_CONFIG.defaultRepo;
  var wf = BUILD_CONFIG.workflowFile;
  var url =
    'https://api.github.com/repos/' +
    repo +
    '/actions/workflows/' +
    encodeURIComponent(wf) +
    '/runs?per_page=20&event=workflow_dispatch';
  var res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var json = await res.json();
  return (json.workflow_runs || []).map(function (run) {
    return {
      run_number: run.run_number,
      display_title: run.display_title,
      name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
      created_at: run.created_at,
      actor: run.actor ? run.actor.login : null,
    };
  });
}

async function loadHistory() {
  var list = $('buildHistoryList');
  if (!list) return;
  list.innerHTML =
    '<div class="build-history-loading">' + esc(t.buildHistoryLoading || 'Loading…') + '</div>';
  try {
    var runs = await fetchRuns();
    if (!runs.length) {
      list.innerHTML =
        '<div class="build-history-empty">' + esc(t.buildHistoryEmpty || 'No builds yet.') + '</div>';
      return;
    }
    list.innerHTML = runs
      .map(function (run) {
        var cls = statusClass(run.status, run.conclusion);
        var label = statusLabel(run.status, run.conclusion);
        var actor = run.actor || '—';
        var title = run.display_title || run.name || 'workflow';
        return (
          '<a class="build-run ' +
          cls +
          '" href="' +
          esc(run.html_url) +
          '" target="_blank" rel="noopener">' +
          '<div class="build-run-top">' +
          '<span class="build-run-status">' +
          esc(label) +
          '</span>' +
          '<span class="build-run-id">#' +
          run.run_number +
          '</span>' +
          '</div>' +
          '<div class="build-run-title">' +
          esc(title) +
          '</div>' +
          '<div class="build-run-meta">' +
          '<span>' +
          esc(actor) +
          '</span>' +
          '<span>' +
          esc(formatTime(run.created_at)) +
          '</span>' +
          '</div>' +
          '</a>'
        );
      })
      .join('');
  } catch (err) {
    list.innerHTML =
      '<div class="build-history-empty build-history-error">' +
      esc((t.buildHistoryError || 'Failed to load history') + ': ' + (err.message || err)) +
      '</div>';
  }
}

function startAutoRefresh() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(function () {
    if (document.hidden) return;
    var panel = $('panel-build');
    if (panel && panel.classList.contains('active')) loadHistory();
  }, 20000);
}

async function onSubmit(e) {
  e.preventDefault();
  var btn = $('buildSubmit');
  var inputs = collectInputs();
  if (!inputs.os_patch_level) {
    setStatus(t.buildNeedPatch || 'Select a security patch.', 'error');
    return;
  }

  btn.disabled = true;
  btn.classList.add('is-loading');
  setStatus(t.buildDispatching || 'Triggering owner GitHub Actions…', 'info');

  try {
    var headers = { 'Content-Type': 'application/json' };
    // Optional site key if owner set BUILD_KEY on Vercel and BUILD_CONFIG.buildKey
    if (BUILD_CONFIG.buildKey) {
      headers['X-Build-Key'] = BUILD_CONFIG.buildKey;
    }

    var res = await fetch(BUILD_CONFIG.buildApiPath || '/api/build', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(inputs),
    });
    var data = {};
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      throw new Error(data.error || 'HTTP ' + res.status);
    }

    setStatus(t.buildDispatched || 'Build triggered on owner repo. See history / Actions.', 'ok');
    showToast(t.buildDispatchedToast || 'Build started');
    setTimeout(loadHistory, 2000);
    setTimeout(loadHistory, 8000);
  } catch (err) {
    setStatus((t.buildDispatchFail || 'Failed') + ': ' + (err.message || err), 'error');
    showToast(t.buildDispatchFail || 'Failed');
  } finally {
    btn.disabled = false;
    btn.classList.remove('is-loading');
  }
}

export function prefillBuild(opts) {
  opts = opts || {};
  if (opts.kernel && $('buildKernel')) {
    $('buildKernel').value = opts.kernel;
    refreshPatchOptions();
  }
  if (opts.patch && $('buildPatch')) $('buildPatch').value = opts.patch;
  if (opts.version && $('buildVersionName')) $('buildVersionName').value = opts.version;
  var tab = document.querySelector('.tab[data-panel="panel-build"]');
  if (tab) tab.click();
  var form = $('buildForm');
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function initBuildUi() {
  applyI18n();

  if ($('buildKittisuRepo')) $('buildKittisuRepo').value = BUILD_CONFIG.defaultKittisuRepo;
  if ($('buildKittisuBranch')) $('buildKittisuBranch').value = 'main';

  var kernelSel = $('buildKernel');
  if (kernelSel && !kernelSel.options.length) {
    DATA_FILES.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.kernel;
      opt.textContent = f.label;
      kernelSel.appendChild(opt);
    });
    kernelSel.value = '5.15';
  }

  var kpm = $('buildKpm');
  if (kpm && !kpm.options.length) {
    [
      { v: 'disabled (关闭)', l: t.buildKpmOff || 'Disabled' },
      { v: 'enabled (开启)', l: t.buildKpmOn || 'Enabled' },
    ].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v;
      opt.textContent = o.l;
      kpm.appendChild(opt);
    });
  }

  var artifact = $('buildArtifact');
  if (artifact && !artifact.options.length) {
    [
      { v: '仅上传 AnyKernel3.zip', l: t.buildArtifactAk3 || 'AnyKernel3 only' },
      { v: '上传全部', l: t.buildArtifactAll || 'All artifacts' },
    ].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v;
      opt.textContent = o.l;
      artifact.appendChild(opt);
    });
    artifact.value = '上传全部';
  }

  var variant = $('buildVariant');
  if (variant && !variant.options.length) {
    ['KittiSU', 'ReSukiSU', 'SukiSU', 'Official'].forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      variant.appendChild(opt);
    });
  }

  if ($('buildSusfs')) $('buildSusfs').checked = true;
  kernelSel && kernelSel.addEventListener('change', refreshPatchOptions);
  $('buildForm') && $('buildForm').addEventListener('submit', onSubmit);
  $('buildRefreshHistory') && $('buildRefreshHistory').addEventListener('click', loadHistory);

  var actions = $('buildOpenActions');
  if (actions) {
    actions.href =
      'https://github.com/' +
      BUILD_CONFIG.defaultRepo +
      '/actions/workflows/' +
      BUILD_CONFIG.workflowFile;
  }

  loadHistory();
  startAutoRefresh();
}
