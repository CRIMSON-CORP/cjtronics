import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
  CircularProgress,
  Container,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ screens, widgets, screenWidgets }) => {
  const { query } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(query.screen_id);

  const handleSelectChange = (event) => {
    setSelectedScreen(event.target.value);
  };

  const addedScreenWidgets = screenWidgets.map((widget) => widget.widgetReference);
  const widgetsNotAdded = widgets.filter(
    (widget) => !addedScreenWidgets.includes(widget.reference)
  );

  return (
    <>
      <Head>
        <title>Widgets | Devias Kit</title>
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
            <Typography variant="h5">Widgets</Typography>
            <FormControl fullWidth>
              <InputLabel id="scrren-select-label">Select Screen</InputLabel>
              <Select
                id="screen-select"
                labelId="scrren-select-label"
                label="Select Screen"
                value={selectedScreen}
                onChange={handleSelectChange}
              >
                {screens.screen.map((item) => (
                  <MenuItem key={item.reference} value={item.reference}>
                    {item.screenName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack spacing={1}>
              <Typography variant="h6">Screen Widgets</Typography>
              <Grid container spacing={3}>
                {screenWidgets.length > 0 ? (
                  screenWidgets.map((widget) => (
                    <Grid key={widget.reference} item xs={12} md={6}>
                      <Widget
                        {...widget}
                        widgetRef={widget.widgetReference}
                        screenRef={query.screen_id}
                        added={true}
                      />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="subtitle2">No Widgets</Typography>
                )}
              </Grid>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="h6">Available Widgets</Typography>
              <Grid container spacing={3}>
                {widgetsNotAdded.length > 0 ? (
                  widgetsNotAdded.map((widget) => (
                    <Grid key={widget.reference} item xs={12} md={6}>
                      <Widget
                        {...widget}
                        widgetRef={widget.reference}
                        screenRef={query.screen_id}
                        added={false}
                      />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="subtitle2">No widgets to add</Typography>
                )}
              </Grid>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function Widget({ widgetName, widgetSource, added, widgetRef, screenRef }) {
  const [requestProcessing, setRequestProcessing] = useState(false);
  const { replace, asPath } = useRouter();
  const handleToggleWidget = async () => {
    setRequestProcessing(true);
    try {
      await toast.promise(
        axios.post(`/api/admin/widgets/toggle-widget`, {
          widgetRef,
          screenRef,
          added,
        }),
        {
          loading: `${added ? 'Removing' : 'Adding'} Widget, Hang on...`,
          success: (response) => {
            replace(asPath);
            return response.data.message;
          },
          error: (error) => {
            return error.response?.data?.message || error.message;
          },
        }
      );
    } catch (error) {}

    setRequestProcessing(false);
  };
  return (
    <Card>
      <CardHeader title={widgetName} />
      <CardActionArea>
        <Link href={`/${widgetSource}`}>
          <CardMedia component="iframe" src={`/${widgetSource}`} sx={{ aspectRatio: 1 / 0.75 }} />
        </Link>
      </CardActionArea>
      <CardActions>
        <Button
          onClick={handleToggleWidget}
          disabled={requestProcessing}
          startIcon={
            requestProcessing && <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
          }
          variant="contained"
          fullWidth
        >
          {added ? 'Remove Widget' : 'Add Widget'}
        </Button>
      </CardActions>
    </Card>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [screens, widgets, screenWidgets] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, '/widget'),
      getResourse(ctx.req, `/widget/screen/${ctx.query.screen_id}`),
    ]);
    return {
      props: { screens, widgets, screenWidgets },
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
