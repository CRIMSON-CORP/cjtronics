import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ screens }) => {
  const [selectedScreen, setSelectedScreen] = useState('');

  const { replace } = useRouter();

  const handleSelectChange = (event) => {
    setSelectedScreen(event.target.value);
    replace(`/widgets/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Widgets | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Typography variant="h5">Widgets</Typography>
            <FormControl fullWidth>
              <InputLabel id="scrren-select-label">Select Screen</InputLabel>
              <Select
                id="screen-select"
                labelId="scrren-select-label"
                label="Select Screen"
                value={selectedScreen}
                onChange={handleSelectChange}
              >
                {screens.screen.map((item) => (
                  <MenuItem key={item.reference} value={item.reference}>
                    {item.screenName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="h6">Please select screen to view existing widgets.</Typography>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function Widget() {
  return (
    <Card>
      <CardHeader title="Weather App" />
      <CardActionArea>
        <Link href="/assets/widgets/clock.html">
          <CardMedia component="iframe" src="/assets/widgets/clock.html" />
        </Link>
      </CardActionArea>
      <CardActions>
        <Button variant="contained" fullWidth>
          Remove Widget
        </Button>
      </CardActions>
    </Card>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [screens] = await Promise.all([getResourse(ctx.req, '/screen')]);
    return {
      props: { screens },
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
