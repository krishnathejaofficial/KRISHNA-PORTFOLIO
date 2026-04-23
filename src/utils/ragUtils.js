/**
 * Simple client-side RAG utility.
 * Given a user query, scores each knowledge chunk by keyword overlap
 * and returns the top-k most relevant chunks as a single context string.
 */

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

// Common English stop words to ignore
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'was', 'were', 'has', 'have', 'had',
  'that', 'this', 'with', 'from', 'his', 'her', 'their', 'what',
  'your', 'you', 'can', 'how', 'did', 'about', 'also', 'into',
  'all', 'any', 'its', 'our', 'more', 'been', 'not', 'but', 'who',
]);

export function getRelevantContext(query, chunks, topK = 5) {
  const queryTokens = tokenize(query).filter(w => !STOP_WORDS.has(w));

  if (queryTokens.length === 0) {
    // Return first few chunks as default context
    return chunks.slice(0, topK).join('\n\n');
  }

  const scored = chunks.map(chunk => {
    const chunkTokens = tokenize(chunk);
    const chunkSet = new Set(chunkTokens);
    let score = 0;
    for (const qt of queryTokens) {
      // Exact match
      if (chunkSet.has(qt)) score += 2;
      // Partial match (substring)
      for (const ct of chunkSet) {
        if (ct.includes(qt) || qt.includes(ct)) score += 0.5;
      }
    }
    return { chunk, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk)
    .join('\n\n');
}
