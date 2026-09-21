import {
  BrightnessMedium,
  CheckCircle,
  Close,
  Monitor,
  Refresh,
  Restore,
  Save,
  Search,
  VolumeDown,
  VolumeUp,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Unstable_Grid2 as Grid,
  IconButton,
  InputAdornment,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllScreens } from 'src/lib/actions';

const BRIGHTNESS_MIN = 10;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_VOLUME = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000;

const Page = ({ screens }) => {
  const router = useRouter();
  const screenList = useMemo(() => screens?.screen || [], [screens?.screen]);

  const [searchQuery, setSearchQuery] = useState('');
  const [onlineMap, setOnlineMap] = useState({});

  // Central WebSocket connection for all screens on this page
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;

    // Initialize online statuses from initial screen data
    const initialMap = {};
    screenList.forEach((scr) => {
      if (scr.deviceId) {
        initialMap[scr.deviceId] = !!scr.isOnline;
      }
    });
    setOnlineMap(initialMap);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) return;

    const connect = () => {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempts.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'device-connection' && Array.isArray(data.screens)) {
            setOnlineMap((prev) => {
              const updated = { ...prev };
              data.screens.forEach((item) => {
                if (item.deviceId) {
                  updated[item.deviceId] = !!item.isOnline;
                }
              });
              return updated;
            });
          }
        } catch (err) {
          console.error('Socket message parse error', err);
        }
      };

      socket.onclose = () => {
        socketRef.current = null;
        if (isUnmounted.current || reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) return;
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isUnmounted.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [screenList]);

  // Dispatch live settings to active device over socket
  const sendLiveSettings = useCallback((deviceId, settings) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: 'device-settings',
          deviceId,
          data: settings,
        })
      );
    }
  }, []);

  // Filter screens by name, screen ID, or device ID
  const filteredScreens = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return screenList;
    return screenList.filter((screen) => {
      const name = (screen.screenName || '').toLowerCase();
      const id = (screen.screenId || '').toLowerCase();
      const device = (screen.deviceId || '').toLowerCase();
      return name.includes(query) || id.includes(query) || device.includes(query);
    });
  }, [screenList, searchQuery]);

  const totalCount = screenList.length;
  const onlineCount = screenList.filter(
    (s) => (s.deviceId && onlineMap[s.deviceId]) ?? s.isOnline
  ).length;

  return (
    <>
      <Head>
        <title>Screen Settings | Dalukwa Admin</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={4}>
            {/* Header & Summary */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <div>
                <Typography variant="h4">Screen Settings</Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                  Centralized management for brightness, volume, and device codes across all
                  screens.
                </Typography>
              </div>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip label={`${totalCount} Screens`} variant="outlined" />
                <Chip
                  label={`${onlineCount} Online`}
                  color={onlineCount > 0 ? 'success' : 'default'}
                  variant="filled"
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => router.replace(router.asPath)}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search by screen name, screen ID, or device code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Screen Cards Grid */}
            {filteredScreens.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <Monitor sx={{ fontSize: 48, color: 'text.secondary', mb: 2, mx: 'auto' }} />
                <Typography variant="h6">No screens found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchQuery
                    ? `No screens matched "${searchQuery}". Try a different search term.`
                    : 'There are no screens registered in the system.'}
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {filteredScreens.map((screen) => {
                  const isOnline = screen.deviceId
                    ? !!onlineMap[screen.deviceId]
                    : !!screen.isOnline;
                  return (
                    <Grid xs={12} sm={6} lg={4} key={screen.id || screen.reference}>
                      <ScreenCard
                        screen={screen}
                        isOnline={isOnline}
                        onSaveLiveSettings={sendLiveSettings}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function ScreenCard({ screen, isOnline, onSaveLiveSettings }) {
  const initialBrightness = screen.brightness ?? DEFAULT_BRIGHTNESS;
  const initialVolume = screen.volume ?? DEFAULT_VOLUME;
  const initialDeviceCode = screen.deviceId || '';

  const [brightness, setBrightness] = useState(initialBrightness);
  const [volume, setVolume] = useState(initialVolume);
  const [deviceCode, setDeviceCode] = useState(initialDeviceCode);

  const [savedState, setSavedState] = useState({
    brightness: initialBrightness,
    volume: initialVolume,
    deviceCode: initialDeviceCode,
  });

  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    brightness !== savedState.brightness ||
    volume !== savedState.volume ||
    deviceCode.trim() !== savedState.deviceCode.trim();

  const handleReset = () => {
    setBrightness(savedState.brightness);
    setVolume(savedState.volume);
    setDeviceCode(savedState.deviceCode);
  };

  const handleSave = async () => {
    const trimmedDeviceCode = deviceCode.trim();
    if (!trimmedDeviceCode) {
      toast.error('Device code cannot be empty');
      return;
    }

    const settingsChanged = brightness !== savedState.brightness || volume !== savedState.volume;
    const deviceCodeChanged = trimmedDeviceCode !== savedState.deviceCode;

    if (!settingsChanged && !deviceCodeChanged) return;

    setIsSaving(true);

    const saveOperations = async () => {
      // 1. Update brightness/volume if changed
      if (settingsChanged) {
        await axios.post('/api/admin/screens/update-settings', {
          reference: screen.reference,
          brightness,
          volume,
        });

        // Push live over WebSocket to device
        onSaveLiveSettings(trimmedDeviceCode, { brightness, volume });
      }

      // 2. Update device ID if changed
      if (deviceCodeChanged) {
        await axios.post('/api/admin/screens/edit', {
          ...screen,
          reference: screen.reference,
          screenUniqueId: trimmedDeviceCode,
          screenCity: screen.screenCity || 'Lagos',
        });
      }

      setSavedState({
        brightness,
        volume,
        deviceCode: trimmedDeviceCode,
      });
    };

    await toast
      .promise(saveOperations(), {
        loading: `Saving settings for ${screen.screenName}...`,
        success: `Settings saved for ${screen.screenName}`,
        error: (err) => err.response?.data?.message || err.message || 'Failed to save settings',
      })
      .catch(() => {});

    setIsSaving(false);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: isOnline ? 'success.light' : 'grey.300',
              color: isOnline ? 'success.dark' : 'grey.600',
            }}
          >
            <Monitor />
          </Avatar>
        }
        title={
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="h6" noWrap sx={{ maxWidth: 170 }}>
              {screen.screenName}
            </Typography>
            <Chip size="small" label={screen.screenId} />
          </Stack>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {screen.screenWidth && screen.screenHeight
              ? `${screen.screenWidth} × ${screen.screenHeight} px`
              : 'Unknown Resolution'}
          </Typography>
        }
        action={
          <Chip
            size="small"
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'default'}
            variant={isOnline ? 'filled' : 'outlined'}
          />
        }
      />
      <Divider />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={3}>
          {/* Device Code / Device ID */}
          <TextField
            fullWidth
            size="small"
            label="Device Code"
            variant="outlined"
            value={deviceCode}
            onChange={(e) => setDeviceCode(e.target.value)}
            helperText="The unique ID displayed on the physical screen"
          />

          {/* Brightness Slider */}
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <BrightnessMedium fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={500}>
                  Brightness
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {brightness}%
              </Typography>
            </Stack>
            <Slider
              value={brightness}
              min={BRIGHTNESS_MIN}
              max={100}
              valueLabelDisplay="auto"
              onChange={(_e, val) => setBrightness(val)}
            />
          </Stack>

          {/* Volume Slider */}
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                {volume > 0 ? (
                  <VolumeUp fontSize="small" color="action" />
                ) : (
                  <VolumeDown fontSize="small" color="action" />
                )}
                <Typography variant="body2" fontWeight={500}>
                  Volume
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {volume}%
              </Typography>
            </Stack>
            <Slider
              value={volume}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              onChange={(_e, val) => setVolume(val)}
            />
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ px: 2, py: 1.5, justifyContent: 'space-between' }}>
        {isDirty ? (
          <Tooltip title="Discard unsaved changes">
            <Button
              size="small"
              color="inherit"
              startIcon={<Restore />}
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
          </Tooltip>
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="text.secondary">
              Saved
            </Typography>
          </Stack>
        )}
        <Button
          size="small"
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardActions>
    </Card>
  );
}

export const getServerSideProps = async (ctx) => {
  try {
    const screens = await getAllScreens(ctx.req, { size: 1000 });
    return {
      props: {
        screens: screens || { screen: [], totalRows: 0 },
      },
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
};
