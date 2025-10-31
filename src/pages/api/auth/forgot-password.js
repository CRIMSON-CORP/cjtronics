import axios from 'src/lib/axios';

export default async function handler(req, res) {
  try {
    const response = await axios.post('/auth/forget-password', req.body);

    if (response.data.status && response.status === 200) {
      res.status(response.status).json(response.data);
    } else throw response;
  } catch (error) {
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    res.status(400).json(error.response.data);
  }
}
