import { Add, Close, PlayCircleFilledRounded, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Unstable_Grid2 as Grid,
  IconButton,
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
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import Iframe from 'src/components/Iframe';
import ProtectDashboard from 'src/hocs/protectDashboard';
import useToggle from 'src/hooks/useToggle';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { screenLayoutToReferenceMap } from 'src/pages/screens';

const Page = ({ screens, screen, layouts, campaignSquence }) => {
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
              <SendCampaignToDevice reference={screen.reference} />
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

            <CampaignSquencing screen={screen} campaignSquence={campaignSquence.list} />
          </Stack>
        </Container>
      </Box>
      <Script src="https://www.youtube.com/iframe_api" />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function CampaignSquencing({ screen, campaignSquence }) {
  const [sequence, setSequence] = useState(
    campaignSquence.map((item, index) => {
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
          reorder: sequence.map((item) => item.reference).join(','),
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
            <PlayAds sequence={sequence} screenName={screen.displayName} />
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
              <Link
                style={{ textDecoration: 'none', width: '100%' }}
                href={`/ad-account/${campaign.reference}`}
              >
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
    const [screens, screen, layouts, campaignSquence] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, `/screen/${ctx.query.screen_id}`),
      getResourse(ctx.req, '/screen/layout/all'),
      getResourse(ctx.req, `/ads-account/sequence/${ctx.query.screen_id}`),
    ]);
    return {
      props: { screens, screen, layouts, campaignSquence },
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

function SendCampaignToDevice({ reference }) {
  const [requestProcessing, setRequestProcessing] = useState(false);
  const sendCampaignToDevice = async () => {
    setRequestProcessing(true);
    try {
      await toast.promise(
        axios.post('/api/admin/campaigns/set-campaign-status', { status: true, reference }),
        {
          loading: 'Sending request, hold on a moment...',
          success: (response) => {
            return response.data.message;
          },
          error: (err) => {
            return err.response?.data?.message || err.message;
          },
        }
      );
    } catch (error) {}
    setRequestProcessing(false);
  };
  return (
    <Button
      disabled={requestProcessing}
      onClick={sendCampaignToDevice}
      startIcon={requestProcessing ? <CircularProgress /> : <PlayCircleFilledRounded />}
      variant="outlined"
    >
      Play
    </Button>
  );
}

function PlayAds({ sequence, screenName }) {
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [ads, setAds] = useState([]);
  const { open, close, state } = useToggle();
  const loadAds = async () => {
    setRequestProcessing(true);

    try {
      const campaigns = await Promise.all(
        sequence.map(({ reference }) =>
          axios.get(`/api/admin/campaigns/get-campaign-by-ad-account?reference=${reference}`)
        )
      );
      const campaignsLists = campaigns.map((campaign) => campaign.data.data.list).flat();
      const campaignUploads = campaignsLists
        .map((campaign) =>
          campaign.playUploads.map((file) => {
            file.duration = campaign.playDuration;
            return file;
          })
        )
        .flat();

      // const maxLength = Math.max(...campaignsLists.map((arr) => arr.length));
      // const mergedCampaigns = Array.from({ length: maxLength }).flatMap((_, i) =>
      //   campaignsLists.map((arr) => arr[i]).filter((val) => val !== undefined)
      // );
      setAds(campaignUploads);
      open();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setRequestProcessing(false);
    }
  };

  const onComplete = () => {
    close();
    setAds([]);
  };

  return (
    <>
      <Button
        onClick={loadAds}
        variant="outlined"
        disabled={requestProcessing}
        startIcon={requestProcessing ? <CircularProgress /> : <PlayCircleFilledRounded />}
      >
        Play
      </Button>
      <Dialog maxWidth="md" fullWidth onClose={close} open={state}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>{screenName}</Typography>
            <IconButton onClick={close}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', p: 0, display: 'flex', backgroundColor: 'black' }}>
          <SequenceAds sequence={ads} onComplete={onComplete} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SequenceAds({ sequence, onComplete }) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (currentAdIndex < sequence.length) {
      const adDuration = sequence[currentAdIndex].duration * 1000; // Convert to milliseconds
      const timer = setTimeout(() => {
        setCurrentAdIndex((prevIndex) => prevIndex + 1);
      }, adDuration);

      return () => clearTimeout(timer); // Clear the timer when component unmounts or index changes
    } else if (onComplete) {
      onComplete(); // Call the callback when all ads have finished
    }
  }, [currentAdIndex, sequence, onComplete]);

  if (currentAdIndex >= sequence.length) {
    return null; // No more ads to show
  }

  const currentAd = sequence[currentAdIndex];

  return (
    <Stack
      direction="row"
      alignItems="center"
      style={{
        width: '100%',
        flex: 1,
        transition: 'transform 1s ease-out',
        transform: `translateX(-${currentAdIndex * 100}%)`,
      }}
    >
      {sequence.map((file, index) => {
        return (
          <Box key={file.reference} width="100%" height="100%" flex="none">
            {file.uploadType === 'image' ? (
              <Image
                src={file.uploadFile}
                alt={file.uploadName}
                width={500}
                height={400}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              />
            ) : file.uploadType === 'video' ? (
              <video
                controls
                src={file.uploadFile}
                alt={file.uploadName}
                autoPlay={index === currentAdIndex}
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              />
            ) : file.uploadType === 'html' ? (
              index === currentAdIndex && (
                <Iframe content={file.uploadFile} styles={{ width: '100%', height: '100%' }} />
              )
            ) : null}
          </Box>
        );
      })}
    </Stack>
  );

  // return (
  //   <Stack direction="row">
  //     {currentAd.uploadType === 'image' ? (
  //       <Image
  //         src={currentAd.uploadFile}
  //         alt={currentAd.uploadName}
  //         width={500}
  //         height={400}
  //         style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
  //       />
  //     ) : currentAd.uploadType === 'video' ? (
  //       <video
  //         src={currentAd.uploadFile}
  //         alt={currentAd.uploadName}
  //         width={500}
  //         height={400}
  //         controls
  //         autoPlay
  //         style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
  //       />
  //     ) : currentAd.uploadType === 'html' ? (
  //       <Iframe content={currentAd.uploadFile} styles={{ width: '100%', height: 'auto' }} />
  //     ) : null}
  //   </Stack>
  // );
}
