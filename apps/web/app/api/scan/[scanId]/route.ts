export async function GET(
  _req: Request,
  { params }: { params: Promise<{ scanId: string }> },
) {
  try {
    const { scanId } = await params;

    const base =
      process.env.COST_API_BASE ?? 'https://cost-api-706230423289.us-central1.run.app';

    const r = await fetch(`${base}/v1/scan/${scanId}`, {
      signal: AbortSignal.timeout(10000),
    } as RequestInit);

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      return Response.json({ error: 'Status check timed out' }, { status: 504 });
    }
    return Response.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}
