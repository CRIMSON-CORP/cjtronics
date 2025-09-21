import axios from 'axios';
import https from 'https';

export default axios.create({
  baseURL: `${process.env.BACKEND_DOMAIN}/${process.env.BACKEND_VERSION}`,
  timeout: 60000, // optional
  httpsAgent: new https.Agent({ keepAlive: true }),
});
