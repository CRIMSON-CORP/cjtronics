import { Pause, PlayArrow } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CircularProgress,
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
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
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
            <Activecampaigns campaigns={campaigns} />
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

function Activecampaigns({ campaigns }) {
  const { query, replace } = useRouter();
  const handleRowsPerPageChange = useCallback((event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('size', event.target.value);
    queryParams.delete('screen_id');
    replace(`/campaign/active-campaigns?${queryParams.toString()}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    queryParams.delete('screen_id');
    replace(`/campaign/active-campaigns?${queryParams.toString()}`);
  };

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
                    <PauseToggle campaign={campaign} />
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

function PauseToggle({ campaign }) {
  const [isPaused, setIsPaused] = useState(campaign.is_paused ?? false);
  const [requestProcessing, setRequestProcessing] = useState(false);

  const togglePause = async () => {
    const nextPaused = !isPaused;
    setRequestProcessing(true);

    try {
      await toast.promise(
        axios.put('/api/admin/campaigns/pause', {
          campaign_id: campaign.reference,
          is_paused: nextPaused,
        }),
        {
          loading: nextPaused ? 'Pausing campaign...' : 'Resuming campaign...',
          success: (response) => {
            setIsPaused(nextPaused);
            return response.data.message || (nextPaused ? 'Campaign paused' : 'Campaign resumed');
          },
          error: (error) => error.response?.data?.message || error.message,
        }
      );
    } catch (error) {
      console.log(error);
    }
    setRequestProcessing(false);
  };

  return (
    <Button
      size="small"
      variant={isPaused ? 'contained' : 'outlined'}
      color={isPaused ? 'success' : 'warning'}
      onClick={togglePause}
      disabled={requestProcessing}
      startIcon={
        requestProcessing ? (
          <CircularProgress size={14} color="inherit" />
        ) : isPaused ? (
          <PlayArrow />
        ) : (
          <Pause />
        )
      }
    >
      {isPaused ? 'Resume' : 'Pause'}
    </Button>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
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
});

export default Page;
