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
  Pagination,
  Select,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
function groupLogsByDate(logs, dateKey) {
  const grouped = logs.reduce((acc, log) => {
    const date = log[dateKey || 'createdAt'].split(' ')[0];
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

const Page = ({ logs, users }) => {
  const { replace, query } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState('');

  const handleScreenSelect = (event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('user', event.target.value);
    replace(`/activity-log?${queryParams.toString()}`);
    setSelectedScreen(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Activity Log | Cjtronics Admin</title>
      </Head>
      <Box component="main" flexGrow={1} py={2}>
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Typography variant="h5">Activity Log</Typography>

            <Grid container spacing={3}>
              <Grid xs={12} md={6} lg={4}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Filter by User</InputLabel>
                  <Select
                    labelId="scrren-select-label"
                    id="screen-select"
                    value={selectedScreen}
                    label="Select Screen"
                    onChange={handleScreenSelect}
                  >
                    {users.users.map((user) => (
                      <MenuItem key={user.reference} value={user.reference}>
                        {user.firstName} {user.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <ActivityHistory logs={logs} sx={{ height: '100%' }} />
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

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  try {
    const [logs, users] = await Promise.all([
      getResourse(ctx.req, '/activity', params),
      getResourse(ctx.req, '/users'),
    ]);
    return {
      props: { logs, users },
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

function formatRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);

  const units = [
    { unit: 'year', value: 60 * 60 * 24 * 365 }, // Approximation for a year
    { unit: 'month', value: 60 * 60 * 24 * 30 }, // Approximation for a month
    { unit: 'week', value: 60 * 60 * 24 * 7 },
    { unit: 'day', value: 60 * 60 * 24 },
    { unit: 'hour', value: 60 * 60 },
    { unit: 'minute', value: 60 },
    { unit: 'second', value: 1 },
  ];

  for (const { unit, value } of units) {
    if (Math.abs(diffInSeconds) >= value) {
      const amount = Math.floor(diffInSeconds / value);
      return rtf.format(amount, unit);
    }
  }

  return rtf.format(0, 'second'); // Default to "now" if difference is less than a second
}

function ActivityHistory({ logs }) {
  const { query } = useRouter();
  const handleRowsPerPageChange = useCallback((event, value) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', value);
    replace(`/acitvity?${queryParams.toString()}`);
  }, []);

  const groupedLogs = groupLogsByDate(logs.list);

  const count = Math.ceil(+logs.totalRows / +logs.rowsPerPage);
  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title={logs.length === 0 ? 'No activity history' : 'Activities'} />
        <List sx={{ maxHeight: '50vh', overflow: 'auto' }} subheader={<li />}>
          {groupedLogs.map((log) => (
            <li key={log.date}>
              <ul>
                <ListSubheader>{log.date}</ListSubheader>
                {log.logs.map((_log, index, arr) => {
                  const hasDivider = index < arr.length - 1;
                  const ago = formatRelativeTime(new Date(_log.createdAt));
                  return (
                    <ListItem divider={hasDivider} key={_log.reference}>
                      <ListItemAvatar>
                        <SvgIcon>
                          <Campaign />
                        </SvgIcon>
                      </ListItemAvatar>
                      <ListItemText
                        primary={_log.message}
                        primaryTypographyProps={{ variant: 'subtitle1' }}
                        secondary={`${_log.createdAt} (${ago})`}
                        secondaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  );
                })}
              </ul>
            </li>
          ))}
          {groupedLogs.length === 0 && <ListItem>No activity history</ListItem>}
        </List>
        <Divider />
      </Card>
      {count !== 0 && (
        <Pagination
          sx={{ ul: { justifyContent: 'space-between' } }}
          count={count}
          siblingCount={4}
          page={parseInt(logs.currentPage)}
          onChange={handleRowsPerPageChange}
        />
      )}
    </Stack>
  );
}
