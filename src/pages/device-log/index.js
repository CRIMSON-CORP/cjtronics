import {
  Box,
  Container,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ screens }) => {
  const [selectedScreen, setSelectedScreen] = useState('');
  const { push } = useRouter();

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
    push(`/device-log/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Generate Report | Devias Kit</title>
      </Head>
      <Box component="main" flexGrow={1} py={2}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} lg={4}>
              <FormControl fullWidth>
                <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                <Select
                  labelId="scrren-select-label"
                  id="screen-select"
                  name="screenId"
                  value={selectedScreen}
                  label="Select Screen"
                  onChange={handleScreenSelect}
                >
                  {screens.map((screen) => (
                    <MenuItem value={screen.reference} key={screen.reference}>
                      {screen.screenName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const screens = await getResourse(ctx.req, `/screen`);
    return {
      props: {
        screens: screens.screen,
      },
    };
  } catch (error) {
    console.log(error);

    if (error?.response?.status === 401) {
      return {
        redirect: {
          destination: '/auth/login?auth=false',
          permanent: false,
        },
      };
    }

    return {
      notFound: true,
    };
  }
});
