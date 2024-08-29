import getCookie from 'src/utils/get-cookie';
import axios from './axios';

export async function getAllOrganizations(req) {
  try {
    const { data } = await axios.get('/organization/all', {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });
    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllScreens(req, params) {
  try {
    const { data } = await axios.get('/screen', {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
      params,
    });

    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function getScreenCities(req) {
  try {
    const { data } = await axios.get('/screen/city/all', {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    return data.data;
  } catch (error) {
    throw error;
  }
}

export async function getScreenLayouts(req) {
  try {
    const { data } = await axios.get('/screen/layout/all', {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
    });

    return data.data;
  } catch (error) {
    throw error;
  }
}
