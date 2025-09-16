import axios from 'src/lib/axios';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export default async function handler(req, res) {
  // extract a particluar cookie from a string of cookies nextjs getServerSideProps?
  try {
    console.log(`${process.env.BACKEND_DOMAIN}/${process.env.BACKEND_VERSION}`, 'backend-url');
    const response = await axios.post('/auth/login', req.body);

    if (response.data.status && response.status === 200) {
      if (response.data.token) {
        res.setHeader(
          'Set-Cookie',
          `${ADMIN_COOKIE_NAME}=${response.data.token}; Max-Age=777600; HttpOnly; Path=/`
        );
      }

      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    console.log(error);

    if (error.data) {
      return res.status(401).json({ message: error.message });
    }
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    res.status(error.response.status).json(error.response.data);
  }
}
