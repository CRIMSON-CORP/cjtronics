import Head from 'next/head';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import handleGSSPError from 'src/utils/handle-gssp-error';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import SnackBar from 'src/components/SnackBar';
import permissions from 'src/utils/permissions-config';
import useProtectPage from 'src/hooks/useProtectPage';
import useRoleProtect from 'src/hooks/useRole';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import { toast } from 'react-hot-toast';

const Page = ({ leagues, event }) => {
  useProtectPage(permissions.create_top_league);
  const { push, query, back } = useRouter();
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  const protectActionWrapper = useRoleProtect(permissions.create_top_league);

  const handleClose = useCallback(() => {
    setSelectedLeague(null);
  }, [setSelectedLeague]);

  const setSelectedLeagueData = useCallback(
    (data) => () => {
      setSelectedLeague(data);
    },
    []
  );

  const closeRequest = useCallback(() => {
    setRequestStatus(null);
  }, []);

  const addTopLeague = useCallback(async () => {
    toast.promise(
      (async () => {
        await axios.post('/api/admin/top-leagues/add-top-league', {
          event_id: event._id,
          league_id: selectedLeague.id,
        });
        push('/top-leagues');
      })(),
      {
        loading: 'Adding Top League',
        error: (error) => `Failed to Add Top League ${error.response.data.message}`,
        success: 'Top League Added',
      }
    );
  }, [event._id, push, selectedLeague?.id]);

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
              <span style={{ opacity: 0.6 }}>Add Top League / Countries</span> / {query.countryId}
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {leagues.map((league) => (
                <Grid item key={league.id}>
                  <Chip
                    onClick={setSelectedLeagueData(league)}
                    avatar={<Avatar alt={league.name} src={league.logo} />}
                    label={league.name}
                    variant="outlined"
                    size="medium"
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>
      <Dialog
        open={!!selectedLeague}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Set Top League</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Set This League as a top League?
          </DialogContentText>
          <Chip
            avatar={<Avatar alt={selectedLeague?.name} src={selectedLeague?.logo} />}
            label={selectedLeague?.name}
            variant="outlined"
            size="medium"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={protectActionWrapper(addTopLeague)} autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
      <SnackBar
        open={!!requestStatus}
        status={requestStatus?.status}
        message={requestStatus?.message}
        setStatus={setSelectedLeagueData}
        handleClose={closeRequest}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
  };

  try {
    const leaguesFetch = axios.get(
      `/${params.eventId ?? 'football'}/leagues?country_name=${params.countryId}`,
      {
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
        },
      }
    );

    const [
      {
        data: { data },
      },
    ] = await Promise.all([leaguesFetch]);

    return {
      props: {
        ...data,
      },
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;
