import { Campaign, Download, Monitor } from '@mui/icons-material';
import { Box, Button, Container, Unstable_Grid2 as Grid, Stack } from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewCampaignActivitieList } from 'src/sections/overview/overview-campaing-activitieslist';
import { OverViewItem } from 'src/sections/overview/overview-item';
import { OverviewScreensList } from 'src/sections/overview/overview-screens-list';

const now = new Date();

const Page = () => (
  <>
    <Head>
      <title>Overview | Devias Kit</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Stack direction="row" justifyContent="flex-end" my={1.5}>
          <Link href="generate-report">
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
              value="4"
              theme="warning.main"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverViewItem
              title="total screens"
              icon={<Monitor />}
              sx={{ height: '100%' }}
              value="4"
              theme="success.main"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverViewItem
              title="active campaigns"
              icon={<Campaign />}
              sx={{ height: '100%' }}
              value="4"
              theme="primary.main"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <OverViewItem
              title="total campaigns"
              icon={<Campaign />}
              sx={{ height: '100%' }}
              value="4"
            />
          </Grid>
          <Grid xs={12} md={6} lg={4}>
            <OverviewScreensList
              screens={[
                {
                  id: '5ece2c077e39da27658aa8a9',
                  name: 'FIWASAYE',
                  location: '(FOL-AKURE)',
                  status: 'offline',
                },
                {
                  id: '5ece2c077e39da27658aa8a2',
                  name: 'EKO HOTEL',
                  location: '(FOL-EKO)',
                  status: 'online',
                },
                {
                  id: '5ece2c077e39da27658aa8a3',
                  name: 'AKIN ADESOLA',
                  location: '(FOL-AKIN)',
                  status: 'offline',
                },
                {
                  id: '5ece2c077e39da27658aa8a4',
                  name: 'BROAD STREET',
                  location: '(FOL-BROAD)',
                  status: 'offline',
                },
                {
                  id: '5ece2c077e39da27658aa8a8',
                  name: 'BISHOP ABOYADE',
                  location: '(FOL-ABO)',
                  status: 'online',
                },
                {
                  id: '5ece2c077e39da27658aa8a6',
                  name: 'ADMIRALTY',
                  location: '(EKNT-LEKKI)',
                  status: 'online',
                },
              ]}
              sx={{ height: '100%' }}
            />
          </Grid>
          <Grid xs={12} md={12} lg={8}>
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
