import getCookie from 'src/utils/get-cookie';
import axios from './axios';

export async function getUsers(req, params) {
  try {
    const { data } = await axios.get('/users', {
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
export async function getAllOrganizations(req, params) {
  try {
    const { data } = await axios.get('/organization', {
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

export async function getScreen(req, screen_id) {
  try {
    const { data } = await axios.get(`/screen/${screen_id}`, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
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

export async function getCompanies(req, params) {
  try {
    const { data } = await axios.get('/company', {
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

export async function getAdAccounts(req) {
  try {
    const { data } = await axios.get('/ads-account', {
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

export async function getResourse(req, url, params) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${getCookie(req)}`,
      },
      params,
    });

    return data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
