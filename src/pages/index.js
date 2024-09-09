import { Campaign, Download, Monitor } from '@mui/icons-material';
import { Box, Button, Container, Unstable_Grid2 as Grid, Stack } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { OverviewCampaignActivitieList } from 'src/sections/overview/overview-campaing-activitieslist';
import { OverViewItem } from 'src/sections/overview/overview-item';
import { OverviewScreensList } from 'src/sections/overview/overview-screens-list';

const now = new Date();

const Page = ({ stats, screens: { screen } }) => {
  const { connectedScreens, screens } = useSocketScreens({ defaultScreens: screen });
  return (
    <>
      <Head>
        <title>Dashboard | Cjtronimcs</title>
      </Head>
      <Box component="main" flexGrow={1}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="flex-end" my={1.5}>
            <Link href="device-log">
              <Button startIcon={<Download />} variant="contained">
                Generate Report
              </Button>
            </Link>
          </Stack>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} lg={3}>
              <OverViewItem
                title="online screens"
                icon={<Monitor />}
                sx={{ height: '100%' }}
                value={connectedScreens}
                theme="warning.main"
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverViewItem
                title="total screens"
                icon={<Monitor />}
                sx={{ height: '100%' }}
                value={stats.totalScreens}
                theme="success.main"
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverViewItem
                title="active campaigns"
                icon={<Campaign />}
                sx={{ height: '100%' }}
                value="4"
                theme={stats.activeCampaigns}
              />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverViewItem
                title="total campaigns"
                icon={<Campaign />}
                sx={{ height: '100%' }}
                value={stats.totalCampaigns}
              />
            </Grid>
            <Grid xs={12} md={6} lg={5}>
              <OverviewScreensList screens={screens} sx={{ height: '100%' }} />
            </Grid>
            <Grid xs={12} md={12} lg={7}>
              <OverviewCampaignActivitieList
                activities={[
                  {
                    id: 'f69f88012978187a6c12897f',
                    activity: 'Danjuma Created new campaign: MTN Champion',
                    timeAgo: '2024-08-13,08:20',
                  },
                  {
                    id: 'f69f88012978187a6c12892f',
                    activity: 'Danjuma Created new campaign: Realtor',
                    timeAgo: '2024-08-13,05:24',
                  },
                  {
                    id: 'f69f88012978187a6c16897f',
                    activity: 'Abdulwahab Updated campaign: Petite Talk Show',
                    timeAgo: '2024-08-12,11:00',
                  },
                ]}
                sx={{ height: '100%' }}
              />
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
    const [stats, screens] = await Promise.all([
      getResourse(ctx.req, `/stats/dashboard`),
      getResourse(ctx.req, `/screen`),
    ]);
    return {
      props: {
        stats,
        screens,
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

function useSocketScreens({ defaultScreens }) {
  const [screens, setScreens] = useState(defaultScreens);
  useEffect(() => {
    const socket = new WebSocket('wss://cjtronics-websocket-server.onrender.com');

    socket.onopen = () => {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === 'device-connection')
          if (data.screens) {
            setScreens(data.screens);
          }
      };
    };

    return () => socket.close();
  }, []);

  const connectedScreens = screens.filter((screen) => screen.isOnline).length;
  return {
    screens,
    connectedScreens,
  };
}
