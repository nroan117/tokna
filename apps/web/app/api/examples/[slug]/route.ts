import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'data', 'examples', `${slug}.json`);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // If the cached file is still in progress, the backend will return its current state.
    // In production, we'll want these to be fully 'complete'.
    return NextResponse.json(data);
  } catch (error) {
    console.error('Example fetch error:', error);
    return NextResponse.json({ error: 'Example not found' }, { status: 404 });
  }
}
