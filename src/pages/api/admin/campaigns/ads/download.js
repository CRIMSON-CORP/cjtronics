export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    res.status(400).send('Missing URL');
    return;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*',
      },
    });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    const filename = url.split('/').pop().split('?')[0] || 'download';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Download failed');
  }
}
