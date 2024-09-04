import { Add, PlayCircleFilledRounded, Save, SendToMobile } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { screenLayoutToReferenceMap } from 'src/pages/screens';

const Page = ({ screens, screen, layouts, campaingSquence }) => {
  const { query } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(query.screen_id);
  const { replace } = useRouter();
  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
    replace(`/campaign/campaign-schedule/${event.target.value}`);
  };

  const screenLayoutReference = useMemo(
    () => screens.screen.find((screen) => (screen.reference = selectedScreen))?.layoutReference,
    [query.screen_id]
  );

  const layoutInfo = useMemo(
    () => layouts.find((layout) => layout.reference === screenLayoutReference),
    [screenLayoutReference]
  );

  return (
    <>
      <Head>
        <title>Campaign Schedule | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack justifyContent="space-between" direction="row" gap={3} flexWrap="wrap">
              <Typography variant="h5">Campaign schedule</Typography>
              <Button startIcon={<SendToMobile />} variant="outlined">
                Send to Device
              </Button>
            </Stack>
            <Grid container>
              <Grid xs={12} sm={6} lg={4}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                  <Select
                    label="Select Screen"
                    value={selectedScreen}
                    labelId="scrren-select-label"
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
            </Grid>
            <Stack spacing={1}>
              <Typography variant="h6">Screen Layout</Typography>
              <Box maxWidth={200}>
                {screenLayoutToReferenceMap[screenLayoutReference](undefined, layoutInfo)}
              </Box>
            </Stack>

            <CampaignSquencing screen={screen} campaingSquence={campaingSquence} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function CampaignSquencing({ screen, campaingSquence }) {
  const [sequence, setSequence] = useState(
    campaingSquence.map((item, index) => {
      item.orderIndex = index;
      return item;
    })
  );
  return (
    <Grid container spacing={3}>
      <Grid xs={12} sm={6}>
        <CampaignSequence screen={screen} sequence={sequence} setSequence={setSequence} />
      </Grid>
      <Grid xs={12} sm={6}>
        <SequenceResult sequence={sequence} screen={screen} />
      </Grid>
    </Grid>
  );
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function CampaignSequence({ screen, sequence, setSequence }) {
  const [requestProcessing, setrequestProcessing] = useState(false);
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(sequence, result.source.index, result.destination.index);

    setSequence(items);
  };

  const handleSaveOrder = async () => {
    setrequestProcessing(true);
    try {
      await toast.promise(
        axios.post(`/api/admin/ad-account/set-ads-sequence?screen_id=${screen.reference}`, {
          reorder: sequence.map((item) => item.orderIndex).join(','),
        }),
        {
          loading: 'Saving Order, hold on a moment...',
          success: (response) => {
            return response.data.message;
          },
          error: (err) => {
            return err.response?.data?.message || err.message;
          },
        }
      );
    } catch (error) {}
    setrequestProcessing(false);
  };
  return (
    <Card>
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            justifyContent="space-between"
          >
            <Typography variant="h6">Sequence Ad Accounts in screen</Typography>
            <Button
              onClick={handleSaveOrder}
              disabled={requestProcessing}
              startIcon={
                requestProcessing ? (
                  <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                ) : (
                  <Save />
                )
              }
              variant="outlined"
            >
              Save
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Typography variant="body2">Drag and drop to arrange ad accounts</Typography>
          <Link href="/campaign/create-campaign">
            <Button startIcon={<Add />}>New Campaign</Button>
          </Link>
        </Stack>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="campaigns">
            {(provided, snapshot) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {sequence.map((campaign, index) => (
                  <Draggable
                    index={index}
                    key={campaign.id}
                    draggableId={campaign.orderIndex.toString()}
                  >
                    {(_provided) => (
                      <ListItem
                        ref={_provided.innerRef}
                        {..._provided.draggableProps}
                        {..._provided.dragHandleProps}
                        sx={{
                          userSelect: 'none',
                          ..._provided.draggableProps.style,
                        }}
                      >
                        <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
                          {campaign.name}
                        </Paper>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}

function SequenceResult({ sequence, screen }) {
  return (
    <Card>
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Typography variant="h6">Sequence Ad Accounts</Typography>
            <Button startIcon={<PlayCircleFilledRounded />} variant="outlined">
              Play
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Typography variant="body2">{screen.displayName}</Typography>
        <List>
          {sequence.map((campaign) => (
            <ListItem
              key={campaign.id}
              sx={{
                userSelect: 'none',
              }}
            >
              <Link style={{ textDecoration: 'none' }} href={`/ad-account/${campaign.reference}`}>
                <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
                  {campaign.name}
                </Paper>
              </Link>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [screens, screen, layouts, campaingSquence] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, `/screen/${ctx.query.screen_id}`),
      getResourse(ctx.req, '/screen/layout/all'),
      getResourse(ctx.req, `/ads/sequence/${ctx.query.screen_id}`),
    ]);
    return {
      props: { screens, screen, layouts, campaingSquence },
    };
  } catch (error) {
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
