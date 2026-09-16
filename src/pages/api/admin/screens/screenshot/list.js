import axios from 'src/lib/axios';
import getCookie from 'src/utils/get-cookie';

export default async function handler(req, res) {
  try {
    const { screenRef, page = 1, size = 30 } = req.query;
    let url = `/screen/screenshot/list?page=${page}&size=${size}`;
    if (screenRef) url += `&screenRef=${screenRef}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    if (response.data.status && response.status === 200) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    if (error?.data?.startsWith && error.data.startsWith('<')) {
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
