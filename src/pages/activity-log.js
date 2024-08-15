import { Campaign } from '@mui/icons-material';
import {
  Box,
  Card,
  CardHeader,
  Container,
  Divider,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import Head from 'next/head';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const logs = [
  {
    adId: 'vid-20240807-wa0003',
    campaignId: '66b670c959425eff120edd04',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-13T06:26:29.390Z',
    __v: 0,
    campaignName: 'Legend P 1',
    adAccountName: 'EYEKONTACT ADS-PREMIUM | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240807-wa0003',
    campaignId: '66b7166fa76268eb9d12e0bb',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:25:27.251Z',
    __v: 0,
    campaignName: 'Legend P 1',
    adAccountName: 'EYEKONTACT ADS-PREMIUM | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'new-mano-lekki',
    campaignId: '66b67d4f59425eff120ee757',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:25:17.234Z',
    __v: 0,
    campaignName: 'Mano',
    adAccountName: 'EYEKONTACT ADS-RETAIL | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240809-wa0022',
    campaignId: '66b6728059425eff120edeb1',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:25:07.218Z',
    __v: 0,
    campaignName: 'MTN TY Bello',
    adAccountName: 'EYEKONTACT ADS-BRONZE | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240412-wa0006',
    campaignId: '66b6f830a76268eb9d12bb04',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:24:57.201Z',
    __v: 0,
    campaignName: 'Royal S 2',
    adAccountName: 'EYEKONTACT ADS-SILVER 2 | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240628-wa0015',
    campaignId: '66b6799459425eff120ee3d2',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:24:47.184Z',
    __v: 0,
    campaignName: 'Chivas S 1',
    adAccountName: 'EYEKONTACT ADS-SILVER 1 | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240812-wa0003',
    campaignId: '66b9d960a76268eb9d151470',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:24:37.167Z',
    __v: 0,
    campaignName: 'Goldberg P 3',
    adAccountName: 'EYEKONTACT ADS-PREMIUM 3 | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240808-wa0003',
    campaignId: '66b7161ba76268eb9d12e013',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T21:24:27.152Z',
    __v: 0,
    campaignName: 'Amstel ',
    adAccountName: 'EYEKONTACT ADS-PREMIUM 2 | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
  {
    adId: 'vid-20240812-wa0003',
    campaignId: '66b9d9a9a76268eb9d1514f0',
    screenId: '66b5f3775a4c2ce74ec93233',
    messageType: 'play',
    loggedOn: '2024-08-12T19:09:33.951Z',
    __v: 0,
    campaignName: 'Goldberg P 3',
    adAccountName: 'EYEKONTACT ADS-PREMIUM 3 | ADMIRALTY ',
    screenName: 'ADMIRALTY ',
    screenIdName: 'EKNT-LEKKI',
  },
];

function groupLogsByDate(logs, dateKey) {
  const grouped = logs.reduce((acc, log) => {
    const date = log[dateKey || 'loggedOn'].split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {});

  return Object.keys(grouped).map((date) => ({
    date,
    logs: grouped[date],
  }));
}

const Page = () => {
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedAdAccount, setSelectedAdAccount] = useState('');

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
  };

  const handleAdAccountSelect = (event) => {
    setSelectedAdAccount(event.target.value);
  };

  const exportAsCSV = () => {
    if (!selectedScreen) {
      return toast.error('Please select a screen!');
    }
  };

  const groupedLogs = groupLogsByDate(logs);

  return (
    <>
      <Head>
        <title>Activity Log | Devias Kit</title>
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
            <Typography variant="h5">Activity Log</Typography>

            <Grid container spacing={3}>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Filter by User</InputLabel>
                  <Select
                    labelId="scrren-select-label"
                    id="screen-select"
                    value={selectedScreen}
                    label="Select Screen"
                    onChange={handleScreenSelect}
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <ActivityHistory logs={groupedLogs} sx={{ height: '100%' }} />
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function ActivityHistory({ logs }) {
  return (
    <Card>
      <CardHeader title={logs.length === 0 ? 'No activity history' : 'Activities'} />
      <List sx={{ maxHeight: '50vh', overflow: 'auto' }} subheader={<li />}>
        {logs.map((log) => (
          <li key={log.date}>
            <ul>
              <ListSubheader>{log.date}</ListSubheader>
              {log.logs.map((_log, index) => {
                const hasDivider = index < history.length - 1;
                console.log(_log);
                const ago = formatDistanceToNow(new Date(_log.loggedOn));
                return (
                  <ListItem divider={hasDivider} key={_log.campaignId}>
                    <ListItemAvatar>
                      <SvgIcon>
                        <Campaign />
                      </SvgIcon>
                    </ListItemAvatar>
                    <ListItemText
                      primary={_log.adId}
                      primaryTypographyProps={{ variant: 'subtitle1' }}
                      secondary={`${_log.loggedOn} (${ago})`}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                );
              })}
            </ul>
          </li>
        ))}
      </List>
      <Divider />
    </Card>
  );
}
