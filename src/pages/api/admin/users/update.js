import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const response = await axios.post(`/admin/user/update/${req.body.id}`, req.body, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });
    if (response.data.success) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }
    res.status(error.status).json(error.data);
  }
}
