export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://defaulte97eb1c2739d4877876c1d0faa65b5.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c973dacd63cf4c8b9963c23103ae2746/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=0ZhuWCQABmh8WUD8dZBYWgtmDxoRXNVaCgtq5-SPlp4',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const text = await response.text();

    return res.status(200).json({
      success: true,
      response: text,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Unknown error',
    });
  }
}
