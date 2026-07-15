/**
 * Vercel Serverless — trigger owner's GitHub Actions (kernel-custom.yml).
 *
 * Env (Vercel → Settings → Environment Variables):
 *   GH_PAT          (required) Owner fine-grained PAT: Actions Read/Write on this repo
 *   GITHUB_REPO     (optional) default: thanhhuybynight/GKI_KittiSU
 *   GITHUB_REF      (optional) default: main
 *   GITHUB_WORKFLOW (optional) default: kernel-custom.yml
 *   BUILD_KEY       (optional) if set, client must send header X-Build-Key
 */

const ALLOWED_KERNELS = new Set(['5.10', '5.15', '6.1', '6.6', '6.12']);
const ALLOWED_KPM = new Set([
  'disabled (关闭)',
  'enabled (开启)',
  'patched (开启并修补，尚不支持)',
]);
const ALLOWED_ARTIFACT = new Set(['仅上传 AnyKernel3.zip', '上传全部']);
const ALLOWED_VARIANT = new Set(['KittiSU', 'ReSukiSU', 'SukiSU', 'Official']);

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Build-Key');
}

function asBool(v, def) {
  if (typeof v === 'boolean') return v;
  if (v == null || v === '') return def;
  const s = String(v).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(s)) return true;
  if (['false', '0', 'no', 'off'].includes(s)) return false;
  return def;
}

function str(v, def) {
  if (v == null || v === '') return def;
  return String(v).trim();
}

function validate(body) {
  const inputs = {
    kernel_version: str(body.kernel_version, ''),
    os_patch_level: str(body.os_patch_level, ''),
    kernelsu_variant: str(body.kernelsu_variant, 'KittiSU') || 'KittiSU',
    kittisu_repo: str(body.kittisu_repo, 'terebiko/KittiSU') || 'terebiko/KittiSU',
    kittisu_branch: str(body.kittisu_branch, 'main') || 'main',
    version: str(body.version, ''),
    use_kpm: str(body.use_kpm, 'disabled (关闭)') || 'disabled (关闭)',
    use_zram: asBool(body.use_zram, false),
    use_bbg: asBool(body.use_bbg, false),
    use_rekernel: asBool(body.use_rekernel, false),
    cancel_susfs: asBool(body.cancel_susfs, false),
    droidspaces: str(body.droidspaces, 'off') || 'off',
    droidspaces_ntsync: asBool(body.droidspaces_ntsync, false),
    supp_op: asBool(body.supp_op, false),
    artifact_upload_mode: str(body.artifact_upload_mode, '上传全部') || '上传全部',
  };

  if (!ALLOWED_KERNELS.has(inputs.kernel_version)) {
    return { error: 'Invalid kernel_version' };
  }
  if (!/^(lts|\d{4}-\d{2})$/.test(inputs.os_patch_level)) {
    return { error: 'Invalid os_patch_level (use YYYY-MM or lts)' };
  }
  if (!ALLOWED_VARIANT.has(inputs.kernelsu_variant)) {
    return { error: 'Invalid kernelsu_variant' };
  }
  if (!ALLOWED_KPM.has(inputs.use_kpm)) {
    return { error: 'Invalid use_kpm' };
  }
  if (!ALLOWED_ARTIFACT.has(inputs.artifact_upload_mode)) {
    return { error: 'Invalid artifact_upload_mode' };
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(inputs.kittisu_repo)) {
    return { error: 'Invalid kittisu_repo' };
  }
  if (!/^[\w./@+-]+$/.test(inputs.kittisu_branch) || inputs.kittisu_branch.length > 200) {
    return { error: 'Invalid kittisu_branch' };
  }
  if (inputs.version.length > 80) {
    inputs.version = inputs.version.slice(0, 80);
  }
  if (!inputs.version) {
    inputs.version = `web-${inputs.kernel_version}-${inputs.os_patch_level}`.slice(0, 80);
  }

  // GitHub workflow_dispatch requires all values as strings
  const payload = {};
  for (const [k, v] of Object.entries(inputs)) {
    payload[k] = typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v);
  }
  return { inputs: payload };
}

module.exports = async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'thanhhuybynight/GKI_KittiSU';
  const ref = process.env.GITHUB_REF || 'main';
  const workflow = process.env.GITHUB_WORKFLOW || 'kernel-custom.yml';

  if (!token) {
    return res.status(500).json({
      error: 'Server misconfigured: set GH_PAT in Vercel Environment Variables',
    });
  }

  if (process.env.BUILD_KEY) {
    const key = req.headers['x-build-key'] || '';
    if (key !== process.env.BUILD_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  body = body || {};

  const checked = validate(body);
  if (checked.error) {
    return res.status(400).json({ error: checked.error });
  }

  const url =
    'https://api.github.com/repos/' +
    repo +
    '/actions/workflows/' +
    encodeURIComponent(workflow) +
    '/dispatches';

  try {
    const gh = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'GKI-KittiSU-Vercel-Build',
      },
      body: JSON.stringify({ ref, inputs: checked.inputs }),
    });

    if (gh.status === 204 || gh.status === 200) {
      return res.status(200).json({
        ok: true,
        message: 'Build triggered on owner repo',
        repo,
        workflow,
        ref,
        inputs: checked.inputs,
        actions_url: 'https://github.com/' + repo + '/actions/workflows/' + workflow,
      });
    }

    let detail = 'HTTP ' + gh.status;
    try {
      const errBody = await gh.json();
      if (errBody.message) detail = errBody.message;
    } catch (_) {}

    return res.status(gh.status === 401 || gh.status === 403 ? 502 : 502).json({
      error: 'GitHub dispatch failed: ' + detail,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Dispatch error: ' + (err && err.message ? err.message : String(err)),
    });
  }
};
