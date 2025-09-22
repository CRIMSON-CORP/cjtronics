import { Add, Close, PlayCircleFilledRounded, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
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
import { useEffect, useMemo, useRef, useState } from 'react';
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

  const layoutInfo = useMemo(
    () => layouts.find((layout) => layout.reference === screen.layoutReference),
    []
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
              <SendCampaignToDevice
                isOnline={screen.isOnline}
                deviceId={screen.deviceId}
                reference={screen.reference}
              />
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
                {screenLayoutToReferenceMap[screen.layoutReference](undefined, layoutInfo)}
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

  useEffect(() => {
    setSequence(campaignSquence);
  }, [campaignSquence]);

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
            <PlayAds sequence={sequence} screen={screen} />
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

function SendCampaignToDevice({ isOnline, deviceId, reference }) {
  const [websocket, setWebsocket] = useState(null);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  const maxReconnectAttempts = 10; // you can bump this or make it infinite
  const baseDelay = 2000; // 2s

  const connect = () => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL);

    socket.onopen = () => {
      console.log('WebSocket connected ✅');
      setWebsocket(socket);
      reconnectAttempts.current = 0; // reset attempts
    };

    socket.onclose = () => {
      console.log('WebSocket closed ❌');
      setWebsocket(null);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = baseDelay * Math.pow(2, reconnectAttempts.current); // exponential backoff
        reconnectAttempts.current += 1;
        console.log(`Reconnecting in ${delay / 1000}s...`);

        reconnectTimeout.current = setTimeout(connect, delay);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      socket.close(); // force close, triggers onclose → reconnect
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (websocket) websocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendCampaignToDevice = async () => {
    if (websocket.readyState !== websocket.OPEN)
      return toast.error('Websocket is not Connected, Please Contact Maintainance');
    if (hasSent)
      return toast.error('Campaign already sent to device, Pls try again in less than a minute');
    setRequestProcessing(true);
    try {
      await toast.promise(
        axios.post('/api/admin/campaigns/get-new-campaign-data', { reference: deviceId }),
        {
          loading: 'Getting Campaign data, hold on a moment...',
          success: (response) => {
            websocket.send(
              JSON.stringify({
                event: 'send-to-device',
                deviceId,
                data: response.data,
              })
            );
            setHasSent(true);
            return "Campaign's data sent successfully";
          },
          error: (err) => {
            return err.response?.data?.message || err.message;
          },
        }
      );
    } catch (error) {}
    setRequestProcessing(false);
  };

  // const sendToDevice = () => {
  //   if (!isOnline) {
  //     return toast.error(
  //       'Screen is currently offline, pls make sure screen is online, refresh and try again'
  //     );
  //   }
  //   if (hasSent) {
  //     return toast.error('Schedule already sent to device please try again later');
  //   }
  //   if (websocket.readyState === WebSocket.OPEN) {
  //     websocket.send(
  //       JSON.stringify({
  //         event: 'send-to-device',
  //         device_id: deviceId,
  //       })
  //     );
  //     setHasSent(true);
  //   }
  // };

  useEffect(() => {
    let timeout = null;
    if (hasSent) {
      timeout = setTimeout(() => {
        setHasSent(false);
      }, 60 * 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [hasSent]);

  return (
    <Button
      onClick={sendCampaignToDevice}
      disabled={requestProcessing || !websocket}
      // disabled={requestProcessing || hasSent || !websocket}
      startIcon={
        requestProcessing || !websocket ? <CircularProgress /> : <PlayCircleFilledRounded />
      }
      variant="outlined"
    >
      Send to Device
    </Button>
  );
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function PlayAds({ sequence, screen }) {
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [campaignsLists, setCampaingsLists] = useState([]);
  const { open, close, state } = useToggle();
  const [screenView, setScreenView] = useState('player');
  const [completedScreen, setCompletedScreen] = useState([]);
  const [widgets, setWidgets] = useState([]);

  const loadAds = async () => {
    setRequestProcessing(true);

    try {
      const response = await axios.get(
        `/api/admin/campaigns/get-campaign-ads?reference=${screen.deviceId}`
      );

      const campaigns = response.data.data[0].campaigns;

      const filteredDaysCampaigns = campaigns.filter((campaign) =>
        campaign.adConfiguration.days.includes(days[new Date().getDay()])
      );

      const filteredTimeCampaigns = filteredDaysCampaigns.filter((campaign) => {
        const startTime = new Date(campaign.adConfiguration.startTime).getTime();
        const endTime = new Date(campaign.adConfiguration.endTime).getTime();
        return startTime <= new Date().getTime() && new Date().getTime() <= endTime;
      });

      const filteredCampaigsWithoutView = filteredTimeCampaigns.filter(
        (campaign) => campaign.campaignView
      );

      const widgets = filteredTimeCampaigns.filter((campaign) =>
        ['time', 'weather'].includes(campaign.adId)
      );

      const grouped = filteredCampaigsWithoutView.reduce(
        (acc, obj) => {
          obj.campaignView === 1 ? acc[0].push(obj) : acc[1].push(obj);
          return acc;
        },
        [[], []]
      );

      const filteredGroup = grouped.filter((group) => group.length > 0);

      // const campaignUploads = campaignsLists
      //   .map((campaign) =>
      //     campaign.playUploads.map((file) => {
      //       file.duration = campaign.playDuration;
      //       return file;
      //     })
      //   )
      //   .flat();

      // const maxLength = Math.max(...campaignsLists.map((arr) => arr.length));
      // const mergedCampaigns = Array.from({ length: maxLength }).flatMap((_, i) =>
      //   campaignsLists.map((arr) => arr[i]).filter((val) => val !== undefined)
      // );
      setWidgets(widgets);
      setCampaingsLists(filteredGroup);

      open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    } finally {
      setRequestProcessing(false);
    }
  };

  const onComplete = () => {
    setCompletedScreen((prev) => [...prev, true]);
  };

  const onWidgetComplete = () => {
    setScreenView('player');
    setCompletedScreen([]);
  };

  useEffect(() => {
    if (campaignsLists.length !== 0 || widgets.length !== 0) {
      if (completedScreen.length === campaignsLists.length && widgets.length > 0) {
        setScreenView('widgets');
      } else {
        if (completedScreen.length === campaignsLists.length) {
          console.log('setting');

          setCompletedScreen([]);
          setScreenView('player' + new Date().getTime());
        }
      }
    }
  }, [completedScreen, campaignsLists, widgets]);

  useEffect(() => {
    setCompletedScreen([]);
  }, [screenView]);

  useEffect(() => {
    if (!state) {
      setCompletedScreen([]);
      setScreenView('player' + new Date().getTime());
    }
  }, [state]);

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
      <Dialog
        sx={{
          '.MuiDialog-paper': {
            width: 'auto',
            maxWidth: 'none',
          },
        }}
        fullWidth
        onClose={close}
        open={state}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography>{screen.screenName}</Typography>
            <IconButton onClick={close}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{
            width: 'auto !important',
            overflow: 'hidden',
            p: 0,
            display: 'flex',
            backgroundColor: 'black',
          }}
        >
          {screenView.startsWith('player') ? (
            <Screen screenLayoutRef={screen.layoutReference}>
              {campaignsLists.map((campaignsList, index) => (
                <View
                  campaignsList={campaignsList}
                  key={index}
                  screenView={screenView}
                  setScreenView={setScreenView}
                  onComplete={onComplete}
                />
              ))}
            </Screen>
          ) : (
            <Screen screenLayoutRef="VBSGTREW43">
              <View campaignsList={widgets} onComplete={onWidgetComplete} />
            </Screen>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Screen({ children, screenLayoutRef }) {
  const layoutConfig = screenReferenceToConfig[screenLayoutRef];

  const screenStyle = {
    display: 'grid',
    overflow: 'hidden',
    ...(layoutConfig.horizontal
      ? {
          gridTemplateColumns: layoutConfig.split
            ? layoutConfig.split
                .split(',')
                .map((split) => +split / 100 + 'fr')
                .join(' ')
            : '1fr',
        }
      : {
          gridTemplateRows: layoutConfig.split
            ? layoutConfig.split
                .split(',')
                .map((split) => +split / 100 + 'fr')
                .join(' ')
            : '1fr',
        }),
    aspectRatio: layoutConfig.landscape ? '16/9' : '9/16',
    ...(layoutConfig.landscape
      ? {
          width: '80vw',
          height: 'auto',
        }
      : {
          width: 'auto',
          height: '70vh',
        }),
  };

  return <Box sx={screenStyle}>{children}</Box>;
}

function View({ campaignsList, screenView, setScreenView, onComplete }) {
  const sequence = campaignsList;

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (currentAdIndex < sequence.length) {
      const adDuration = sequence[currentAdIndex].adConfiguration.duration * 1000; // Convert to milliseconds
      const timer = setTimeout(() => {
        setCurrentAdIndex((prevIndex) => prevIndex + 1);
      }, adDuration);

      return () => clearTimeout(timer); // Clear the timer when component unmounts or index changes
    } else {
      onComplete();
      // setTimeout(() => {
      //   setCurrentAdIndex(0);
      // }, 1000 * 20);
    }
  }, [currentAdIndex, sequence]);

  useEffect(() => {
    setCurrentAdIndex(0);
  }, [screenView]);

  return (
    <Box overflow="hidden">
      <Stack
        direction="row"
        alignItems="center"
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          position: 'relative',
          transition: currentAdIndex === 0 ? 'none' : 'transform 1s ease-out',
          transform: `translateX(-${currentAdIndex * 100}%)`,
        }}
      >
        {sequence.map((file, index) => {
          return (
            <Box
              key={file.uploadRef}
              width="100%"
              height="100%"
              flex="none"
              position="absolute"
              sx={{ transform: `translateX(${index * 100}%)` }}
            >
              {file.adType === 'image' ? (
                <Image
                  src={file.adUrl}
                  alt={file.uploadName}
                  width={500}
                  height={400}
                  key={currentAdIndex}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              ) : file.adType === 'video' ? (
                <video
                  loop
                  key={currentAdIndex}
                  controls={false}
                  src={file.adUrl}
                  alt={file.uploadName}
                  autoPlay={index === currentAdIndex}
                  style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                />
              ) : file.adType === 'iframe' ? (
                <>
                  {file.adUrl.startsWith('https://') ? (
                    <CardMedia
                      sx={{ width: '100%', height: '100%', margin: 0, border: 'none' }}
                      component="iframe"
                      className="card media"
                      src={file.adUrl}
                    />
                  ) : (
                    <Iframe
                      content={file.adUrl}
                      styles={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  )}
                </>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Box>
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

const screenReferenceToConfig = {
  VBSGTREW43: {
    landscape: true,
    horizontal: false,
  },
  JHSFER2763: {
    horizontal: true,
    landscape: true,
    split: '80,20',
  },
  HDGTW5763: {
    horizontal: false,
    landscape: false,
  },
  SGDRWT5247: {
    horizontal: true,
    landscape: true,
    split: '50,50',
  },
  KJUYTE4352: {
    horizontal: false,
    landscape: false,
    split: '80,20',
  },
  SGHY5438JH: {
    horizontal: false,
    landscape: false,
    split: '50,50',
  },
};
