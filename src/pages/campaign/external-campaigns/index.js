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
  SvgIcon,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { formatRelativeTime } from 'src/utils/fromRelativeTime';

function groupLogsByDate(logs, dateKey) {
  const grouped = logs.reduce((acc, log) => {
    const date = log[dateKey || 'playAt'].split(' ')[0];
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

const Page = ({ screens }) => {
  const { query, push } = useRouter();
  const [selectedService, setSelectedService] = useState(query.screen_id || '');
  const [selectedDate, setSelectedDate] = useState(query.date ? new Date(query.date) : new Date());

  const handleServiceSelect = (event) => {
    setSelectedService(event.target.value);
    push(`/device-log/${event.target.value}`);
  };

  //   const handleAdAccountSelect = (event) => {
  //     const { value } = event.target;
  //     setSelectedAdAccount(value);
  //     const queryParams = new URLSearchParams(query);
  //     queryParams.delete('screen_id');
  //     queryParams.set('account', value);
  //     push(`/device-log/${selectedService}?${queryParams.toString()}`);
  //   };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const queryParams = new URLSearchParams(query);
    queryParams.set('date', date.toISOString().split('T')[0]);
    queryParams.delete('screen_id');
    push(`/device-log/${selectedService}?${queryParams.toString()}`);
  };

  const hanldePageChange = (_event, value) => {
    const queryParams = new URLSearchParams(query);
    queryParams.delete('screen_id');
    queryParams.set('page', value);
    push(`/device-log/${selectedService}?${queryParams.toString()}`);
  };

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
                <InputLabel id="scrren-select-label">Select Service</InputLabel>
                <Select
                  labelId="scrren-select-label"
                  id="screen-select"
                  name="screenId"
                  value={selectedService}
                  label="Select Service"
                  onChange={handleServiceSelect}
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
                <DatePicker
                  fullWidth
                  label="Select Day"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </FormControl>
            </Grid>
            <Grid xs={12}></Grid>
            {/* <Grid xs={12}>
              <Pagination
                sx={{ ul: { justifyContent: 'space-between' } }}
                count={Math.ceil(logs.totalRows / +logs.rowsPerPage)}
                siblingCount={4}
                page={parseInt(logs.currentPage)}
                onChange={hanldePageChange}
              />
            </Grid> */}
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
  };
  try {
    const [screens] = await Promise.all([getResourse(ctx.req, `/screen`)]);

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
                const hasDivider = index < log.length - 1;
                const ago = formatRelativeTime(new Date(_log.playAt));
                return (
                  <ListItem divider={hasDivider} key={_log.playAt}>
                    <ListItemAvatar>
                      <SvgIcon>
                        <Campaign />
                      </SvgIcon>
                    </ListItemAvatar>
                    <ListItemText
                      primary={_log.uploadName}
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
