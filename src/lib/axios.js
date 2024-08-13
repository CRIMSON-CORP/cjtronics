import axios from 'axios';
import https from 'https';

export default axios.create({
  baseURL: process.env.REACT_APP_BACKEND_DOMAIN,
  timeout: 60000, // optional
  httpsAgent: new https.Agent({ keepAlive: true }),
});
