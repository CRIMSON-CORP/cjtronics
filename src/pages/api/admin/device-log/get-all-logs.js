import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const response = await axios.get(`/activity/device-log/${req.query.screen}`, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
      params: {
        accountRef: req.query.account,
        ...req.query,
      },
    });

    if (response.data.status && response.status === 200)
      res.status(response.status).json(response.data);
    else throw response;
  } catch (error) {
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    if (error.data) {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(error.response.status).json(error.response.data);
  }
}
