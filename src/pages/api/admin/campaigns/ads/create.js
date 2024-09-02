export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default async function handler(req, res) {
  console.log(req.formData);
  try {
    // const response = await axios.post('/organization/create', req.body, {
    //   headers: {
    //     Authorization: `Bearer ${getCookie(req)}`,
    //   },
    // });
    // if (response.data.status && response.status === 200)
    //   res.status(response.status).json(response.data);
    // else throw response;
    res.status(200).json({ test: 'success' });
  } catch (error) {
    console.log(error);
    if (error.data) {
      res.status(401).json({ message: error.message });
    }
    if (!error.response) {
      res.status(503).json({ message: 'No response from Server' });
      return;
    }
    res.status(error.response.status).json(error.response.data);
  }
}
