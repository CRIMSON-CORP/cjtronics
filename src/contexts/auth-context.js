import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import axios from 'src/lib/axios';
import permissions from 'src/utils/permissions-config';

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
      if (status === 200 && data.success) {
        if (data.data.user.role.meta.includes(permissions.browse_admin)) {
          window.sessionStorage.setItem('authenticated', 'true');
          window.sessionStorage.setItem('user', JSON.stringify(data.data));
          dispatch({
            type: HANDLERS.SIGN_IN,
            payload: data.data,
          });
        } else
          throw new Error(
            'Access denied!, only admins are allowed, contact an admin to give access'
          );
      } else throw new Error(data.message);
    } catch (err) {
      throw new Error(err?.response?.data?.message ?? err.message);
    }
  };

  const signOut = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
      window.sessionStorage.setItem('authenticated', 'false');
      window.sessionStorage.setItem('user', null);
      dispatch({
        type: HANDLERS.SIGN_OUT,
      });
    } catch (error) {
      console.log('error loging out', error);
    }
  }, []);

  const contextValues = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
    }),
    [signOut, state]
  );

  return <AuthContext.Provider value={contextValues}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
