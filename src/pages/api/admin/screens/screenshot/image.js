import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ message: 'Reference is required' });
    }

    const response = await axios.get(`/screen/screenshot/image/${reference}`, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
      responseType: 'stream',
    });

    // Forward the content type (e.g. image/jpeg)
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.data.pipe(res);
  } catch (error) {
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }

    // If it's a 4xx or 5xx, the response might be JSON instead of a stream
    if (error.response.data && typeof error.response.data.pipe === 'function') {
      // If it's a stream (e.g., failed to fetch), we need to read it to get the JSON error message
      let errorData = '';
      error.response.data.on('data', (chunk) => {
        errorData += chunk;
      });
      error.response.data.on('end', () => {
        try {
          const parsed = JSON.parse(errorData);
          res.status(error.response.status).json(parsed);
        } catch (e) {
          res.status(error.response.status).json({ message: 'Error retrieving image' });
        }
      });
    } else {
      res.status(error.response.status).json(error.response.data);
    }
  }
}
