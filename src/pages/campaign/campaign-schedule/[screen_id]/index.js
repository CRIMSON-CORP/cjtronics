import { Add, PlayCircleFilledRounded, Save, SendToMobile } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { screenLayoutToReferenceMap } from 'src/pages/screens';

const Page = ({ screens, layouts }) => {
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
            <Stack justifyContent="space-between" direction="row" spacing={3} flexWrap="wrap">
              <Typography variant="h5">Campaign schedule</Typography>
              <Button startIcon={<SendToMobile />} variant="outlined">
                Send to Device
              </Button>
            </Stack>
            <Grid container spacing={3}>
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

            <CampaignSquencing />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function CampaignSquencing() {
  const [sequence, setSequence] = useState([
    'PREMIUM-ADS-1',
    'PREMIUM-ADS-2',
    'Silver-A',
    'Silver-B',
  ]);
  return (
    <Grid container spacing={3}>
      <Grid xs={12} sm={6}>
        <CampaignSequence sequence={sequence} setSequence={setSequence} />
      </Grid>
      <Grid xs={12} sm={6}>
        <SequenceResult sequence={sequence} />
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

function CampaignSequence({ sequence, setSequence }) {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(sequence, result.source.index, result.destination.index);

    setSequence(items);
  };
  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Sequence campaign in screen</Typography>
            <Button startIcon={<Save />} variant="outlined">
              Save
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                  <Draggable draggableId={campaign} index={index} key={campaign}>
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
                          {campaign}
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

function SequenceResult({ sequence }) {
  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Sequence Ad Accounts</Typography>
            <Button startIcon={<PlayCircleFilledRounded />} variant="outlined">
              Play
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Typography variant="body2">EKNT-LEKKI - ADMIRALTY (LEKKI-IKOYI) (1280 X 720)</Typography>
        <List>
          {sequence.map((campaign) => (
            <ListItem
              key={campaign}
              sx={{
                userSelect: 'none',
              }}
            >
              <Paper elevation={3} sx={{ padding: 2, width: '100%' }}>
                {campaign}
              </Paper>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [screens, layouts] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, '/screen/layout/all'),
    ]);
    return {
      props: { screens, layouts },
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
