import fullAxios from 'axios';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export default async function handler(req, res) {
  // extract a particluar cookie from a string of cookies nextjs getServerSideProps?
  try {
    const fakerResponse = await fullAxios.get('https://fakerapi.it/api/v2/books?_quantity=1');
    console.log(fakerResponse.data);
    const response = await fetch('https://cjtronics.tushcode.com/v1/auth/login', {
      method: 'POST',
      body: req.body,
      headers: {
        'content-type': 'application/json',
      },
    });
    const data = await response.json();
    // const response = await fullAxios.post('https://cjtronics.tushcode.com/v1/auth/login', req.body);

    console.log(response, '--axios-response');

    if (data.status && status === 200) {
      if (data.token) {
        res.setHeader(
          'Set-Cookie',
          `${ADMIN_COOKIE_NAME}=${data.token}; Max-Age=777600; HttpOnly; Path=/`
        );
      }

      res.status(status).json(data);
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
