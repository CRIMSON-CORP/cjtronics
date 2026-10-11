import axios from 'src/lib/axios';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.cookies[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  try {
    const response = await axios.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status && response.status === 200) {
      const userData = response.data.data;

      // Normalize user data to ensure backward compatibility with both camelCase and snake_case
      const normalizedUser = {
        ...userData,
        userType: userData.userType,
        account_type: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user: {
          ...(userData.user || {}),
          role: userData.role || userData.user?.role || { meta: [] },
        },
      };

      return res.status(200).json({ status: true, user: normalizedUser });
    } else {
      throw response;
    }
  } catch (error) {
    if (error?.response?.status === 401) {
      // Clear expired or invalid cookie
      res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=deleted; Max-Age=-1; HttpOnly; Path=/`);
      return res.status(401).json({ message: 'Session expired' });
    }

    if (!error.response) {
      return res.status(503).json({ message: 'No response from Server' });
    }

    return res.status(error.response.status).json(error.response.data);
  }
}
