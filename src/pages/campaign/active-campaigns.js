import { Pause, PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import ConfirmAction from 'src/components/ConfirmAction';
import useDeviceSocket from 'src/hooks/useDeviceSocket';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaigns, screens }) => {
  const { query, push } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(query.screen || '');

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
    push(`/campaign/active-campaigns?screen=${event.target.value}`);
  };

  useEffect(() => {
    setSelectedScreen(query.screen || '');
  }, [query.screen]);

  return (
    <>
      <Head>
        <title>Active campaigns | Cjtronics Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h5">Active campaigns({campaigns.list.length})</Typography>
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
                    {screens.screen.map((screen) => (
                      <MenuItem value={screen.reference} key={screen.reference}>
                        {screen.screenName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} sm={6} lg={4}>
                <Button LinkComponent={Link} href="/campaign/active-campaigns">
                  View All
                </Button>
              </Grid>
            </Grid>
            <Activecampaigns campaigns={campaigns} screens={screens} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

const columns = [
  { id: 'campaigns', label: 'Campaigns', minWidth: 170 },
  { id: 'ad_accounts', label: 'Ad Accounts', minWidth: 100 },
  { id: 'screen_name', label: 'Screen Name', minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 120, align: 'right' },
];

function Activecampaigns({ campaigns, screens }) {
  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.list.map((campaign) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={campaign.reference}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.accountName || campaign.adsAccountName}</TableCell>
                  <TableCell>{campaign.screenName}</TableCell>
                  <TableCell align="right">
                    <PauseToggle campaign={campaign} screens={screens} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

function PauseToggle({ campaign, screens }) {
  const [isPaused, setIsPaused] = useState(campaign.is_paused ?? false);
  const { toggleCampaignPause } = useDeviceSocket();

  const screen = useMemo(() => {
    return screens?.screen?.find(
      (s) => s.reference === campaign.screenReference || s.screenName === campaign.screenName
    );
  }, [screens, campaign.screenReference, campaign.screenName]);

  const deviceId = campaign.deviceId || screen?.deviceId;

  const handleToggle = async () => {
    const nextPaused = !isPaused;
    const result = await toggleCampaignPause({
      campaignId: campaign.reference,
      isPaused: nextPaused,
      deviceId,
    });
    if (result?.success) {
      setIsPaused(nextPaused);
    }
  };

  return (
    <ConfirmAction
      color={isPaused ? 'success' : 'warning'}
      title={isPaused ? 'Resume Campaign?' : 'Pause Campaign?'}
      content={
        isPaused
          ? `Are you sure you want to resume "${campaign.name}"? It will be re-added to the screen playback playlist.`
          : `Are you sure you want to pause "${campaign.name}"? It will be removed from the screen playback playlist.`
      }
      proceedText={isPaused ? 'Yes, Resume' : 'Yes, Pause'}
      action={handleToggle}
      buttonProps={{
        size: 'small',
        variant: isPaused ? 'contained' : 'outlined',
        startIcon: isPaused ? <PlayArrow /> : <Pause />,
      }}
    >
      {isPaused ? 'Resume' : 'Pause'}
    </ConfirmAction>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = async (ctx) => {
  const { screen } = ctx.query;
  try {
    const [campaigns, screens] = await Promise.all([
      getResourse(ctx.req, screen ? `/campaign/screen/${screen}` : `/campaign`, { isActive: true }),
      getResourse(ctx.req, '/screen'),
    ]);

    return {
      props: {
        campaigns,
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
};

export default Page;
