import { Campaign, Upload } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CircularProgress,
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
  Pagination,
  Select,
  SvgIcon,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { formatRelativeTime } from 'src/utils/fromRelativeTime';

function groupLogsByDate(logs, dateKey) {
  const grouped = logs.reduce((acc, log) => {
    const date = log[dateKey || 'playDate'].split(' ')[0];
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

const Page = ({ screens, adAccounts, logs }) => {
  const { query, push } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(query.screen_id || '');
  const [selectedAdAccount, setSelectedAdAccount] = useState(query.account || '');
  const [selectedDateFrom, setSelectedDateFrom] = useState(
    query.dateFrom ? new Date(query.dateFrom) : null
  );
  const [selectedDateTo, setSelectedDateTo] = useState(
    query.dateTo ? new Date(query.dateTo) : null
  );

  const handleScreenSelect = async (event) => {
    setSelectedScreen(event.target.value);
    await push(`/device-log/${event.target.value}`);
    setSelectedAdAccount('');
  };

  const handleAdAccountSelect = (event) => {
    const { value } = event.target;
    setSelectedAdAccount(value);
    const queryParams = new URLSearchParams(query);
    queryParams.delete('screen_id');
    queryParams.set('account', value);
    push(`/device-log/${selectedScreen}?${queryParams.toString()}`);
  };

  const handleDateFromChange = (date) => {
    if (selectedDateTo && date > selectedDateTo) {
      toast.error('The start date cannot be later than the end date.');
      return; // Prevent setting the invalid date
    }
    setSelectedDateFrom(date);
    const queryParams = new URLSearchParams(query);
    queryParams.set('dateFrom', date.toLocaleDateString('en-CA').replaceAll('-', '/'));
    queryParams.delete('screen_id');
    push(`/device-log/${selectedScreen}?${queryParams.toString()}`);
  };

  const handleDateToChange = (date) => {
    if (selectedDateFrom && date < selectedDateFrom) {
      toast.error('The end date cannot be earlier than the start date.');
      return; // Prevent setting the invalid date
    }
    setSelectedDateTo(date);
    const queryParams = new URLSearchParams(query);
    queryParams.set('dateTo', date.toLocaleDateString('en-CA').replaceAll('-', '/'));
    queryParams.delete('screen_id');
    push(`/device-log/${selectedScreen}?${queryParams.toString()}`);
  };

  const hanldePageChange = (_event, value) => {
    const queryParams = new URLSearchParams(query);
    queryParams.delete('screen_id');
    queryParams.set('page', value);
    push(`/device-log/${selectedScreen}?${queryParams.toString()}`);
  };

  const groupedLogs = groupLogsByDate(logs.list);

  return (
    <>
      <Head>
        <title>Generate Report | Cjtronics Kit</title>
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
            <Grid xs={12} sm={6} lg={4}>
              <FormControl fullWidth>
                <InputLabel id="ad-account-select-label">Select Ad Account</InputLabel>
                <Select
                  labelId="ad-account-select-label"
                  id="ad-account-select"
                  value={selectedAdAccount}
                  label="Select Ad Account"
                  onChange={handleAdAccountSelect}
                >
                  {adAccounts.map((adAccount) => (
                    <MenuItem value={adAccount.reference} key={adAccount.reference}>
                      {adAccount.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} spacing={3}>
              <Grid container spacing={3}>
                <Grid item>
                  <FormControl>
                    <DatePicker
                      fullWidth
                      label="Select Day From"
                      value={selectedDateFrom}
                      onChange={handleDateFromChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl>
                    <DatePicker
                      fullWidth
                      label="Select Day To"
                      value={selectedDateTo}
                      onChange={handleDateToChange}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid xs={12}>
              <ExportCSV
                screen={selectedScreen}
                selectedAdAccount={selectedAdAccount}
                selectedDateFrom={selectedDateFrom}
                selectedDateTo={selectedDateTo}
              />
            </Grid>
            <Grid xs={12}>
              <ActivityHistory logs={groupedLogs} sx={{ height: '100%' }} />
            </Grid>
            <Grid xs={12}>
              <Pagination
                sx={{ ul: { justifyContent: 'space-between' } }}
                count={Math.ceil(logs.totalRows / +logs.rowsPerPage)}
                siblingCount={4}
                page={parseInt(logs.currentPage)}
                onChange={hanldePageChange}
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
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
    ...(ctx.query.account ? { accountRef: ctx.query.account } : {}),
    ...(ctx.query.dateFrom ? { dateFrom: ctx.query.dateFrom } : {}),
    ...(ctx.query.dateTo ? { dateTo: ctx.query.dateTo } : {}),
  };

  try {
    const [screens, adAccounts, logs] = await Promise.all([
      getResourse(ctx.req, `/screen`),
      getResourse(ctx.req, `/ads-account/screen/${ctx.query.screen_id}`),
      getResourse(ctx.req, `/activity/device-log/${ctx.query.screen_id}`, params),
    ]);

    return {
      props: {
        screens: screens.screen,
        adAccounts: adAccounts.list,
        logs,
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

function ActivityHistory({ logs }) {
  return (
    <Card>
      <CardHeader title={logs.length === 0 ? 'No activity history' : 'Activities'} />
      <List sx={{ maxHeight: '50vh', overflow: 'auto' }} subheader={<li />}>
        {logs.map((log, index) => (
          <li key={log.date + index}>
            <ul>
              <ListSubheader>{log.date}</ListSubheader>
              {log.logs.map((_log, index) => {
                const hasDivider = index < log.length - 1;
                const ago = formatRelativeTime(new Date(_log.playAt));
                return (
                  <ListItem divider={hasDivider} key={_log.playDate + ' ' + _log.playTime + index}>
                    <ListItemAvatar>
                      <SvgIcon>
                        <Campaign />
                      </SvgIcon>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${_log.accountName}: ${_log.uploadName}`}
                      primaryTypographyProps={{ variant: 'subtitle1' }}
                      secondary={`${_log.playAt} (${ago})`}
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

function ExportCSV({ screen, selectedAdAccount, selectedDateFrom, selectedDateTo }) {
  const [requestProcessing, setRequestProvessing] = useState(false);

  const exportAsCSV = async () => {
    let list = [];
    setRequestProvessing(true);
    try {
      const { data } = await axios.get(`/api/admin/device-log/get-all-logs`, {
        params: {
          screen,
          account: selectedAdAccount,
          dateFrom: selectedDateFrom?.toLocaleDateString('en-CA').replaceAll('-', '/'),
          dateTo: selectedDateTo?.toLocaleDateString('en-CA').replaceAll('-', '/'),
        },
      });
      list = data.data.list;
    } catch (error) {
      return toast.error(error.response?.data?.message ?? error.message);
    } finally {
      setRequestProvessing(false);
    }

    // Convert data to CSV string
    const csvRows = [];

    // Get headers
    const headers = Object.keys(list[0]);
    csvRows.push(headers.join(',')); // Add headers to CSV

    // Loop over the rows
    list.forEach((row) => {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(',')); // Add row to CSV
    });

    // Convert to a CSV string
    const csvString = csvRows.join('\n');

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvString], { type: 'text/csv' }));
    link.download = 'data.csv'; // Name of the downloaded file
    link.click();
  };

  return (
    <Button
      onClick={exportAsCSV}
      startIcon={requestProcessing ? <CircularProgress /> : <Upload />}
      variant="contained"
    >
      Export as CSV
    </Button>
  );
}
