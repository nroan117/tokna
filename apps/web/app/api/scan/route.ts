export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base = process.env.COST_API_BASE ?? 'https://cost-api-706230423289.us-central1.run.app';
    const r = await fetch(`${base}/v1/scan-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // In Next.js 15+ fetch defaults to no timeout, but Cloud Run / Vercel
      // will respect the maxDuration config above for the overall function.
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
