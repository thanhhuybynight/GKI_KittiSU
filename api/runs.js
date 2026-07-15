/**
 * Optional proxy to list workflow runs (avoids browser CORS/rate-limit quirks).
 * Public repos can also be queried directly from the browser.
 *
 * Env: GITHUB_REPO, GH_PAT (optional for higher rate limit), GITHUB_WORKFLOW
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const repo = process.env.GITHUB_REPO || 'thanhhuybynight/GKI_KittiSU';
  const workflow = process.env.GITHUB_WORKFLOW || 'kernel-custom.yml';
  const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;
  const perPage = Math.min(parseInt(req.query.per_page || '20', 10) || 20, 50);

  const url =
    'https://api.github.com/repos/' +
    repo +
    '/actions/workflows/' +
    encodeURIComponent(workflow) +
    '/runs?per_page=' +
    perPage +
    '&event=workflow_dispatch';

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'GKI-KittiSU-Vercel-Runs',
  };
  if (token) headers.Authorization = 'Bearer ' + token;

  try {
    const gh = await fetch(url, { headers });
    if (!gh.ok) {
      const text = await gh.text();
      return res.status(gh.status).json({ error: text.slice(0, 300) });
    }
    const data = await gh.json();
    const runs = (data.workflow_runs || []).map(function (r) {
      return {
        id: r.id,
        run_number: r.run_number,
        name: r.name,
        display_title: r.display_title,
        status: r.status,
        conclusion: r.conclusion,
        html_url: r.html_url,
        created_at: r.created_at,
        updated_at: r.updated_at,
        actor: r.actor ? r.actor.login : null,
      };
    });
    return res.status(200).json({ repo, workflow, runs });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
};
