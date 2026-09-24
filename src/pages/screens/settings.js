import {
  BrightnessMedium,
  CheckCircle,
  Close,
  Monitor,
  Refresh,
  Search,
  VolumeDown,
  VolumeUp,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
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
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useThrottledCallback } from 'use-debounce';
import useDeviceSocket from 'src/hooks/useDeviceSocket';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllScreens } from 'src/lib/actions';

const BRIGHTNESS_MIN = 10;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_VOLUME = 0;
const SETTINGS_SEND_INTERVAL = 150;

const Page = ({ screens }) => {
  const router = useRouter();
  const screenList = useMemo(() => screens?.screen || [], [screens?.screen]);

  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected, isScreenOnline, sendDeviceSettings } = useDeviceSocket();

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
  const onlineCount = screenList.filter((s) => isScreenOnline(s.deviceId, s.isOnline)).length;

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
                  const isOnline = isScreenOnline(screen.deviceId, screen.isOnline);
                  return (
                    <Grid xs={12} sm={6} lg={4} key={screen.id || screen.reference}>
                      <ScreenCard
                        screen={screen}
                        isOnline={isOnline}
                        isConnected={isConnected}
                        sendDeviceSettings={sendDeviceSettings}
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

function ScreenCard({ screen, isOnline, isConnected, sendDeviceSettings }) {
  const initialBrightness = screen.brightness ?? DEFAULT_BRIGHTNESS;
  const initialVolume = screen.volume ?? DEFAULT_VOLUME;

  const [brightness, setBrightness] = useState(initialBrightness);
  const [volume, setVolume] = useState(initialVolume);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Send live socket event to screen device
  const sendSettings = useCallback(
    (next) => {
      if (screen.deviceId) {
        sendDeviceSettings(screen.deviceId, next);
      }
    },
    [sendDeviceSettings, screen.deviceId]
  );

  // Throttled live updates during slider dragging
  const sendThrottled = useThrottledCallback(sendSettings, SETTINGS_SEND_INTERVAL);

  // Persist brightness & volume to backend API
  const persistSettings = useCallback(
    async (next) => {
      setIsSavingSettings(true);
      try {
        await axios.post('/api/admin/screens/update-settings', {
          reference: screen.reference,
          brightness: next.brightness,
          volume: next.volume,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not save screen settings');
      } finally {
        setIsSavingSettings(false);
      }
    },
    [screen.reference]
  );

  // Throttled slider dragging
  const handleChange = (field) => (_event, value) => {
    if (field === 'brightness') setBrightness(value);
    else setVolume(value);
    sendThrottled({ brightness, volume, [field]: value });
  };

  // Slider release: cancel throttled queue, push final socket event immediately, and persist to API
  const handleCommit = (field) => (_event, value) => {
    const next = { brightness, volume, [field]: value };
    sendThrottled.cancel();
    sendSettings(next);
    persistSettings(next);
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
            {screen.deviceId ? ` • Device: ${screen.deviceId}` : ''}
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
              onChange={handleChange('brightness')}
              onChangeCommitted={handleCommit('brightness')}
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
              onChange={handleChange('volume')}
              onChangeCommitted={handleCommit('volume')}
            />
          </Stack>

          {/* Status feedback */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {!isOnline
                ? 'Device is offline (changes will apply when online)'
                : !isConnected
                  ? 'Connecting to live socket...'
                  : 'Live socket active'}
            </Typography>
            {isSavingSettings ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CircularProgress size={12} />
                <Typography variant="caption" color="text.secondary">
                  Saving...
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Synced
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
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
