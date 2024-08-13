import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const response = await axios.post(`/admin/top-league/create`, req.body, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    if (response.data.success) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    console.log(error, 'server');
    res.status(error.response.status).json(error.response.data);
  }
}
