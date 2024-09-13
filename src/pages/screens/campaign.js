import {
  Box,
  Card,
  Container,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllScreens } from 'src/lib/actions';

const Page = ({ screens }) => {
  const [selectedScreen, setSelectedScreen] = useState('');
  const { push } = useRouter();

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
    push(`/screens/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Screen Campaign | Devias Kit</title>
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
            <Typography variant="h5">Screen Campaign</Typography>
            <FormControl fullWidth>
              <InputLabel id="scrren-select-label">Select Screen</InputLabel>
              <Select
                labelId="scrren-select-label"
                id="screen-select"
                value={selectedScreen}
                label="Select Screen"
                onChange={handleScreenSelect}
              >
                {screens.screen.map((screen) => (
                  <MenuItem value={screen.reference} key={screen.reference}>
                    {screen.screenName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <CampaignList />
            <SelectedScreen />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function CampaignList({ campaigns = [] }) {
  return (
    <Card>
      <List>
        {campaigns.length === 0 ? (
          <ListItem>
            <Typography>No Campaigns </Typography>
          </ListItem>
        ) : null}
      </List>
    </Card>
  );
}
function SelectedScreen({ campaigns = [] }) {
  return (
    <Card>
      <List>
        {campaigns.length === 0 ? (
          <ListItem>
            <Typography>No Screens Selected </Typography>
          </ListItem>
        ) : null}
      </List>
    </Card>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const screens = await getAllScreens(ctx.req);

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
