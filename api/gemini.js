// Serverless proxy for Gemini — keeps the API key server-side.
// Key lives in process.env.GEMINI_API_KEY (set in Vercel, NOT VITE_ prefixed
// so it is never bundled into the client).
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
    return;
  }

  try {
    const { body, model } = req.body || {};
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Missing body' });
      return;
    }
    const useModel = typeof model === 'string' && model ? model : DEFAULT_MODEL;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${useModel}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
}
