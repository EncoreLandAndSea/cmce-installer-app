export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://default4ad97cc94a4f4cc58b6d236f262514.4e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/6dce196d44794f1bbb2e3908f976c151/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2IwdNvv3Arv8DFytWQORkaRN5JQHEUrPJUumwIGR3HQ',
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
