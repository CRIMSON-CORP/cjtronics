import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Paper,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon';
import useRoleProtect from 'src/hooks/useRole';
import permissions from 'src/utils/permissions-config';
import usePermission from 'src/hooks/usePermission';

const Page = ({ events }) => {
  return (
    <>
      <Head>
        <title>Events | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Stack spacing={6}>
          <Events events={events} />
        </Stack>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  try {
    const {
      data: { data },
    } = await axios.get(`/admin/event/list`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    return {
      props: data,
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
});

export default Page;

function Events({ events }) {
  const [addEventMode, setEventMode] = useState(false);
  const [eventName, setEventName] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [message, setMessage] = useState(null);

  const router = useRouter();
  const protectActionWrapper = useRoleProtect(permissions.create_event);
  const hasAddEventpermission = usePermission(permissions.create_event);

  const toggleAddEvent = useCallback(
    (value = true) =>
      () => {
        setEventMode(value);
      },
    []
  );

  const onEventNameChange = useCallback((e) => {
    setEventName(e.target.value);
  }, []);

  const addEvention = useCallback(async () => {
    try {
      const response = await axios.post('/api/admin/event/add-event', {
        name: eventName,
      });
      if (response.data.success) {
        router.replace(router.asPath);
        setEventMode(false);
        setEventName('');
        setUpdateSuccess(true);
        setMessage(response.data.message);
      }
    } catch (error) {
      setUpdateSuccess(false);
      setMessage(error.data.message);
    } finally {
      setTimeout(() => {
        setUpdateSuccess(null);
        setMessage(null);
      }, 5000);
    }
  }, [eventName, router]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Typography variant="h4">Events</Typography>
          </Stack>
        </Stack>
        <Card p={3}>
          <Box p={3}>
            {updateSuccess === true && (
              <Alert icon={<CheckCircleIcon width={23} />} severity="success">
                {message}
              </Alert>
            )}
            {updateSuccess === false && (
              <Alert icon={<ExclamationTriangleIcon width={23} />} severity="error">
                {message}
              </Alert>
            )}
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {events.map((event) => (
                <Event key={event.name} {...event} />
              ))}
              <Grid item alignSelf="center">
                {addEventMode ? (
                  <Stack direction="row" spacing={2}>
                    <TextField
                      variant="filled"
                      label="Event name"
                      value={eventName}
                      onChange={onEventNameChange}
                    />
                    <Button variant="outlined" onClick={toggleAddEvent(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={addEvention}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <PlusIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                    >
                      Add Event
                    </Button>
                  </Stack>
                ) : (
                  hasAddEventpermission && (
                    <Button
                      onClick={protectActionWrapper(toggleAddEvent())}
                      startIcon={
                        <SvgIcon fontSize="small">
                          <PlusIcon />
                        </SvgIcon>
                      }
                      variant="contained"
                    >
                      Add Event
                    </Button>
                  )
                )}
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}

function Event({ name }) {
  const [editMode, setEditMode] = useState(false);
  const [eventName, setEventName] = useState(name);

  const protectActionWrapper = useRoleProtect(permissions.update_event);
  const hasEditEventPermission = usePermission(permissions.update_event);

  const onEventNameChange = useCallback((e) => {
    setEventName(e.target.value);
  }, []);

  const toggleEditMode = useCallback(
    (value = true) =>
      () => {
        setEditMode(value);
      },
    []
  );

  return (
    <Grid item>
      <Paper>
        {editMode ? (
          <Stack direction="row" spacing={2} alignItems="center" p={2}>
            <TextField label="Event Name" value={eventName} onChange={onEventNameChange} />
            <Button variant="outlined" onClick={toggleEditMode(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={
                <SvgIcon fontSize="small">
                  <PencilSquareIcon />
                </SvgIcon>
              }
            >
              Edit
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box p={2}>
              <Typography key={name}>{name}</Typography>
            </Box>
            {hasEditEventPermission && (
              <Button
                onClick={protectActionWrapper(toggleEditMode(true))}
                startIcon={
                  <SvgIcon fontSize="small">
                    <PencilSquareIcon />
                  </SvgIcon>
                }
              >
                Edit
              </Button>
            )}
          </Stack>
        )}
      </Paper>
    </Grid>
  );
}
