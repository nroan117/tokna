export const maxDuration = 300;

const MAX_REPO_SIZE_MB = 150;

async function getRepoSize(repoUrl: string): Promise<number> {
  // Extract owner/repo from https://github.com/owner/repo
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  if (!match) return 0;
  const repoPath = match[1].replace(/\.git$/, '');
  
  try {
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      next: { revalidate: 3600 } // cache for 1h
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.size / 1024; // KB to MB
  } catch {
    return 0;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { repo_url } = body;

    if (repo_url && repo_url.includes('github.com')) {
      const sizeMb = await getRepoSize(repo_url);
      if (sizeMb > MAX_REPO_SIZE_MB) {
        return Response.json({ 
          error: `Repository is too large (${Math.round(sizeMb)}MB). The demo limit is ${MAX_REPO_SIZE_MB}MB to keep scans fast.` 
        }, { status: 400 });
      }
    }

    const base = process.env.COST_API_BASE ?? 'https://cost-api-706230423289.us-central1.run.app';
    const r = await fetch(`${base}/v1/scan-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(280000), 
    } as any);
    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e: any) {
    if (e.name === 'TimeoutError') {
      return Response.json({ error: 'Scan timed out' }, { status: 504 });
    }
    return Response.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
