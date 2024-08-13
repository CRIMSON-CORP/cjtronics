import Head from 'next/head';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import handleGSSPError from 'src/utils/handle-gssp-error';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useProtectPage from 'src/hooks/useProtectPage';
import permissions from 'src/utils/permissions-config';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Page = ({ countries, events }) => {
  useProtectPage(permissions.create_top_league);
  const { push, query, asPath, back } = useRouter();

  const handleChange = useCallback(
    (_, value) => {
      push(`/top-leagues/add/${value}`);
    },
    [push]
  );

  return (
    <>
      <Head>
        <title>Add Top Leagues | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Button
            onClick={back}
            variant="text"
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowLeftIcon />
              </SvgIcon>
            }
          >
            <Typography variant="h6">Go Back</Typography>
          </Button>
          <Stack spacing={3}>
            <Typography variant="h4">
              <span style={{ opacity: 0.6 }}>Add Top League </span>/ Countries
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                onChange={handleChange}
                value={query.eventId ?? 'football'}
                aria-label="events tabs"
              >
                {events.map((event) => (
                  <Tab
                    key={event._id}
                    label={event.name}
                    value={event.name.toLowerCase()}
                    {...a11yProps(event.name)}
                  />
                ))}
              </Tabs>
            </Box>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {countries.map((country, index) => (
                <Grid item key={country.code + index}>
                  <Link href={`${asPath}/football/${country.name}`}>
                    <Chip
                      avatar={<Avatar alt={country.name} src={country.flag} />}
                      label={country.name}
                      variant="outlined"
                      size="medium"
                      sx={{ cursor: 'pointer' }}
                    />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
  };

  try {
    const countriesFetch = axios.get(`/${params.eventId ?? 'football'}/countries`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });
    const eventsFetch = axios.get(`/admin/event/list`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    const [
      {
        data: { data },
      },
      {
        data: { data: eventsData },
      },
    ] = await Promise.all([countriesFetch, eventsFetch]);

    const events = eventsData.events.map((event) => ({ _id: event._id, name: event.name }));

    return {
      props: {
        ...data,
        events,
      },
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;
