// api/tailor-resume.js
// Vercel EDGE function — streams NVIDIA SSE directly to the client.
// Edge functions have NO timeout limit when streaming, unlike serverless functions.
// This completely eliminates the 504 FUNCTION_INVOCATION_TIMEOUT error.

export const config = { runtime: 'edge' };

const NVIDIA_API_KEY = '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';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Force streaming so the Edge function pipes chunks immediately — no timeout
  const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!nvRes.ok) {
    const errText = await nvRes.text();
    return new Response(
      JSON.stringify({ error: `NVIDIA ${nvRes.status}: ${errText.slice(0, 300)}` }),
      { status: nvRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Pipe the NVIDIA SSE stream directly back to the browser
  return new Response(nvRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
