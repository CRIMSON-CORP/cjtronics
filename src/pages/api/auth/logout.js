import axios from 'src/lib/axios';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export default async function handler(request, res) {
  if (request.method !== 'POST') {
    return;
  }

  try {
    const response = await axios.post('/auth/logout', request.body, {
      headers: {
        Authorization: `Bearer ${request.cookies[ADMIN_COOKIE_NAME]}`,
      },
    });

    if (response.data.status && response.status === 200) {
      res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=deleted; Max-Age=-1; HttpOnly; Path=/`);
      return res.status(response.status).json(response.data);
    } else {
      throw response;
    }
  } catch (error) {
    if (error.data) {
      return res.status(401).json({ message: error.message });
    }

    if (!error.response) {
      return res.status(503).json({ message: 'No response from Server' });
    }

    return res.status(error.response.status).json(error.response.data);
  }
}
