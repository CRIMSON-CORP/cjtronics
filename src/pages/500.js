import { Replay } from '@mui/icons-material';
import { Box, Button, Container, SvgIcon, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Page = (params) => {
  console.log(params);

  const router = useRouter();
  return (
    <>
      <Head>
        <title>500 | Cjtronics Admin</title>
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
                src="/assets/errors/error-500.png"
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  width: 400,
                }}
              />
            </Box>
            <Typography align="center" sx={{ mb: 3 }} variant="h3">
              500: Theres a server error
            </Typography>
            <Typography align="center" color="text.secondary" variant="body1">
              Theres a server error, could be network issue, please refresh to try again
            </Typography>
            <Button
              onClick={router.reload}
              startIcon={
                <SvgIcon fontSize="small">
                  <Replay />
                </SvgIcon>
              }
              sx={{ mt: 3 }}
              variant="contained"
            >
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Page;
