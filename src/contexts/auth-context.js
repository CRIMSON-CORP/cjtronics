import axios from 'axios';
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

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    let isAuthenticated = false;
    let user = {};

    try {
      isAuthenticated = window.sessionStorage.getItem('authenticated') === 'true';
      user = JSON.parse(window.sessionStorage.getItem('user'));
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
          ...JSON.parse(data.data),
        };
        window.sessionStorage.setItem('authenticated', 'true');
        window.sessionStorage.setItem('user', JSON.stringify(payload));
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
      const { data, status } = await axios.post('/api/auth/logout');
      if (status === 200) {
        window.sessionStorage.setItem('authenticated', 'false');
        window.sessionStorage.setItem('user', null);
        dispatch({
          type: HANDLERS.SIGN_OUT,
        });
        return data.message;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? err.message);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const { data, status } = await axios.post('/api/auth/forgot-password', { email });
      if (status === 200) {
        return data.message;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? err.message);
    }
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
  });

  const contextValues = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      forgotPassword,
      resetPassword,
    }),
    [signIn, signOut, forgotPassword, resetPassword, state]
  );

  return <AuthContext.Provider value={contextValues}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
