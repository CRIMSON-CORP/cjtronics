import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ChevronDoubleLeftIcon from '@heroicons/react/24/solid/ChevronDoubleLeftIcon';
import { Box, Button, Container, SvgIcon, Typography } from '@mui/material';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const Page = () => {
  const { back, asPath } = useRouter();

  return (
    <>
      <Head>
        <title>404 | Cjtronics Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100%',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                mb: 3,
                textAlign: 'center',
              }}
            >
              <img
                alt="Under development"
                src="/assets/errors/error-404.png"
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  width: 400,
                }}
              />
            </Box>
            <Typography align="center" sx={{ mb: 3 }} variant="h3">
              404: The page you are looking for isn’t here
            </Typography>
            <Typography align="center" color="text.secondary" variant="body1">
              You either tried some shady route or you came here by mistake. Whichever it is, try
              using the navigation
            </Typography>
            <Button
              href={asPath}
              component={NextLink}
              variant="contained"
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowPathIcon />
                </SvgIcon>
              }
              sx={{ mt: 3 }}
            >
              Reload this Page
            </Button>
            <Button
              onClick={back}
              variant="outlined"
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
              sx={{ mt: 3 }}
            >
              Go Back
            </Button>
            <Button
              component={NextLink}
              href="/"
              startIcon={
                <SvgIcon fontSize="small">
                  <ChevronDoubleLeftIcon />
                </SvgIcon>
              }
              sx={{ mt: 3 }}
            >
              Go back to dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
