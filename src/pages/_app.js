import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import 'simplebar-react/dist/simplebar.min.css';
import ProtectPage from 'src/components/ProtectPage';
import { AuthConsumer, AuthProvider } from 'src/contexts/auth-context';
import { useNProgress } from 'src/hooks/use-nprogress';
import { createTheme } from 'src/theme';
import { createEmotionCache } from 'src/utils/create-emotion-cache';

const clientSideEmotionCache = createEmotionCache();

const SplashScreen = () => null;

const toastOpt = {
  style: {
    background: '#ffffff',
    color: '#1D2939',
    transition: 'all .75s ease-out',
    padding: '20px',
    fontSize: '1rem',
    backgroundColor: 'white',
    boxShadow: 'rgb(0, 0, 0) 0px 3em 9em -20px',
    borderRadius: '16px',
  },
  success: {
    iconTheme: {
      primary: '#188f48',
      secondary: 'white',
    },
  },

  error: {
    iconTheme: {
      secondary: 'white',
      primary: '#d31313',
    },
  },

  loading: {
    iconTheme: {
      width: 24,
      height: 24,
    },
  },
};

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useNProgress();

  const getLayout = Component.getLayout ?? ((page) => page);

  const theme = createTheme();

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Dalukwa Admin</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <ProtectPage />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthConsumer>
              {(auth) =>
                auth.isLoading ? <SplashScreen /> : getLayout(<Component {...pageProps} />)
              }
            </AuthConsumer>
          </ThemeProvider>
        </AuthProvider>
      </LocalizationProvider>
      <Toaster
        containerStyle={{
          zIndex: '10000000',
        }}
        toastOptions={toastOpt}
      />
    </CacheProvider>
  );
};

export default App;
