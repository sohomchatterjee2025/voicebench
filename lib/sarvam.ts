export const SARVAM_API_URL = 'https://api.sarvam.ai/v1';

export async function testConnection() {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY not set');
  }
  const response = await fetch(`${SARVAM_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      model: 'sarvam-105b-conversations',
      messages: [{ role: 'user', content: 'ping' }],
      temperature: 0,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam connection failed: ${response.status} ${err}`);
  }
  return await response.json();
}

export async function chatCompletion(messages: { role: string; content: string }[], model = 'sarvam-105b-conversations') {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    throw new Error('SARVAM_API_KEY not set');
  }
  const response = await fetch(`${SARVAM_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({ model, messages, temperature: 0 }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam chat error: ${response.status} ${err}`);
  }
  return await response.json();
}
