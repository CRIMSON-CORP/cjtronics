import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const response = await axios.post(`/admin/role/create-permission`, req.body, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    if (response.data.success) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    console.log(error, 'server');
    res.status(error.status).json(error.data);
  }
}
