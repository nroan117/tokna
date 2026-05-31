export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base = process.env.COST_API_BASE ?? 'https://finops-engine-v1-ddgdjwtykq-uc.a.run.app';
    const r = await fetch(`${base}/v1/scan-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
