// Vercel serverless function (Node.js runtime): POST /api/mahjong/advise
// Logic lives in backend/mahjong-ai so it can be tested and reused without Vercel. See docs/mahjong-ai.md.
import { handleAdvise, describeApi } from '../../backend/mahjong-ai/http.js';

const MAX_BODY_BYTES = 16 * 1024;

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function POST(request) {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json(413, { error: 'body_too_large' });
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: 'invalid_json' });
  }
  const { status, body: out } = await handleAdvise(body);
  return json(status, out);
}

export function GET() {
  return json(200, describeApi());
}
