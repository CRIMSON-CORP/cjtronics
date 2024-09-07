import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const response = await axios.put(`/screen/edit/${req.body.reference}`, req.body, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    if (response.data.status && response.status === 200) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    if (error?.data.startsWith('<')) {
      res.status(500).json({ message: 'A Server error occured!' });
      return;
    }
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    res.status(error.response.status).json(error.response.data);
  }
}
