import axios from 'axios';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import toast from 'react-hot-toast';
import { items } from 'src/layouts/dashboard/config';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...// if payload (user) is provided, then is authenticated
      (user
        ? {
            isAuthenticated: true,
            isLoading: false,
            user,
          }
        : {
            isLoading: false,
          }),
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

// The role of this context is to propagate authentication state through the App tree.

export const AuthContext = createContext({ undefined });

const securedRoutes = ['users'];

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);
  const { pathname, push } = useRouter();

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;
    let user = {};

    try {
      isAuthenticated = localStorage.getItem('authenticated') === 'true';
      user = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      console.error(err);
    }
    if (isAuthenticated) {
      dispatch({
        type: HANDLERS.INITIALIZE,
        payload: user,
      });
    } else {
      dispatch({
        type: HANDLERS.INITIALIZE,
      });
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, status } = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (status === 200 && data.status) {
        const payload = {
          token: data.token,
          ...data.data,
        };
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user', JSON.stringify(payload));
        dispatch({
          type: HANDLERS.SIGN_IN,
          payload,
        });
        return data.message;
      } else throw new Error(data.message);
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? err.message);
    }
  };

  const signOut = useCallback(async () => {
    try {
      const response = await axios.post('/api/auth/logout');
      const { data, status } = response;
      if (status === 200) {
        localStorage.setItem('authenticated', 'false');
        localStorage.setItem('user', null);
        dispatch({
          type: HANDLERS.SIGN_OUT,
        });
        return data.message;
      } else {
        throw response;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { data } = await axios.post('/api/auth/forgot-password', { email });
    return data.message;
  }, []);

  const resetPassword = useCallback(async (payload) => {
    try {
      const { data, status } = await axios.post('/api/auth/reset-password', payload);
      if (status === 200) {
        return data.message;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? err.message);
    }
  }, []);

  const createAdvertizer = useCallback(async (payload) => {
    try {
      const { data, status } = await axios.post('/api/auth/create-advertizer', payload);
      if (status === 200) {
        return data.message;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.log(err);

      throw new Error(err?.response?.data?.message ?? err.message);
    }
  }, []);

  const contextValues = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      forgotPassword,
      resetPassword,
      createAdvertizer,
    }),
    [signIn, signOut, forgotPassword, resetPassword, createAdvertizer, state]
  );

  // const { account_type } = state.user;
  const locations = pathname.split('/').filter(Boolean);
  const routesAccessed = items.reduce((acc, item) => {
    if (item?.matchers?.includes(locations[0])) {
      acc.push(item);

      if (item.links) {
        item.links.forEach((link) => {
          if (link.matchers?.includes(locations[1])) {
            acc.push(link);
          }
        });
      }
    }
    return acc;
  }, []);

  if (state.user) {
    const isAllowed =
      routesAccessed.length !== 0
        ? routesAccessed.every((item) =>
            item.roles ? item.roles?.includes(state.user.account_type) : true
          )
        : true;

    if (!isAllowed) {
      push('/');
      toast.error('Youre not authorized to view this page');
      return null;
    }
  }

  // const [] = pathname.split('/');
  // const configForLocation = items.find;
  // console.log(routesAccessed);

  return <AuthContext.Provider value={contextValues}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
