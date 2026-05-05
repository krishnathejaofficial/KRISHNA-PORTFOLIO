// api/tailor-resume.js
// Vercel EDGE function — proxies to NVIDIA NIM.
// When frontend sends stream:true, pipes SSE directly (no timeout).
// When frontend sends stream:false (local dev), returns plain JSON.

export const config = { runtime: 'edge' };

const NVIDIA_API_KEY = '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';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body), // pass through exactly — stream flag comes from frontend
  });

  if (!nvRes.ok) {
    const errText = await nvRes.text();
    return new Response(
      JSON.stringify({ error: `NVIDIA ${nvRes.status}: ${errText.slice(0, 300)}` }),
      { status: nvRes.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const isStreaming = body.stream === true;

  if (isStreaming) {
    // Pipe SSE stream directly — Edge functions have no timeout when streaming
    return new Response(nvRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } else {
    // Return plain JSON (for non-streaming clients)
    const data = await nvRes.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
