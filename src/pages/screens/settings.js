import {
  BrightnessMedium,
  CheckCircle,
  Close,
  Deselect,
  Monitor,
  Refresh,
  Search,
  SelectAll,
  Tune,
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
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Unstable_Grid2 as Grid,
  IconButton,
  InputAdornment,
  Paper,
  Slide,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useThrottledCallback } from 'use-debounce';
import useDeviceSocket from 'src/hooks/useDeviceSocket';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllScreens } from 'src/lib/actions';

const BRIGHTNESS_MIN = 10;
const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_VOLUME = 0;
const SETTINGS_SEND_INTERVAL = 150;
const SIDE_NAV_WIDTH = 305;

const Page = ({ screens }) => {
  const router = useRouter();
  const screenList = useMemo(() => screens?.screen || [], [screens?.screen]);

  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected, isScreenOnline, sendDeviceSettings } = useDeviceSocket();

  // Settings map: screen reference -> { brightness, volume, isSaving }
  const [settingsMap, setSettingsMap] = useState(() => {
    const initial = {};
    screenList.forEach((s) => {
      initial[s.reference] = {
        brightness: s.brightness ?? DEFAULT_BRIGHTNESS,
        volume: s.volume ?? DEFAULT_VOLUME,
        isSaving: false,
      };
    });
    return initial;
  });

  // Selected screen references
  const [selectedRefs, setSelectedRefs] = useState(() => new Set());

  // Global slider state (controls all selected screens simultaneously)
  const [globalBrightness, setGlobalBrightness] = useState(DEFAULT_BRIGHTNESS);
  const [globalVolume, setGlobalVolume] = useState(DEFAULT_VOLUME);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

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

  // Visible screen references based on current search filter
  const visibleRefs = useMemo(() => filteredScreens.map((s) => s.reference), [filteredScreens]);
  const isAllVisibleSelected =
    visibleRefs.length > 0 && visibleRefs.every((ref) => selectedRefs.has(ref));

  // Selected screen objects across the whole system
  const selectedScreens = useMemo(() => {
    return screenList.filter((s) => selectedRefs.has(s.reference));
  }, [screenList, selectedRefs]);

  // Toggle selection for a single screen card
  const handleToggleSelect = useCallback(
    (ref) => {
      setSelectedRefs((prev) => {
        const next = new Set(prev);
        if (next.has(ref)) {
          next.delete(ref);
        } else {
          next.add(ref);
          // Set global sliders to the most recently selected screen card's values
          const screen = screenList.find((s) => s.reference === ref);
          const current = settingsMap[ref] || {
            brightness: screen?.brightness ?? DEFAULT_BRIGHTNESS,
            volume: screen?.volume ?? DEFAULT_VOLUME,
          };
          setGlobalBrightness(current.brightness);
          setGlobalVolume(current.volume);
        }
        return next;
      });
    },
    [screenList, settingsMap]
  );

  // Toggle "Select All" scoped to currently visible/filtered screens
  const handleToggleSelectAllVisible = useCallback(() => {
    if (isAllVisibleSelected) {
      // Deselect all visible screens
      setSelectedRefs((prev) => {
        const next = new Set(prev);
        visibleRefs.forEach((ref) => next.delete(ref));
        return next;
      });
    } else {
      // Select all visible screens
      setSelectedRefs((prev) => {
        const next = new Set(prev);
        visibleRefs.forEach((ref) => next.add(ref));
        return next;
      });
      // Initialize global sliders from the last visible screen
      const lastScreen = filteredScreens[filteredScreens.length - 1];
      if (lastScreen) {
        const current = settingsMap[lastScreen.reference] || {
          brightness: lastScreen.brightness ?? DEFAULT_BRIGHTNESS,
          volume: lastScreen.volume ?? DEFAULT_VOLUME,
        };
        setGlobalBrightness(current.brightness);
        setGlobalVolume(current.volume);
      }
    }
  }, [filteredScreens, isAllVisibleSelected, settingsMap, visibleRefs]);

  const handleClearSelection = useCallback(() => {
    setSelectedRefs(new Set());
  }, []);

  // Throttled live socket updates for individual card changes
  const sendIndividualThrottled = useThrottledCallback((deviceId, next) => {
    if (deviceId) {
      sendDeviceSettings(deviceId, next);
    }
  }, SETTINGS_SEND_INTERVAL);

  // Handle individual screen card slider changes
  const handleIndividualChange = useCallback(
    (ref, field, value) => {
      const screen = screenList.find((s) => s.reference === ref);
      const current = settingsMap[ref] || {
        brightness: screen?.brightness ?? DEFAULT_BRIGHTNESS,
        volume: screen?.volume ?? DEFAULT_VOLUME,
        isSaving: false,
      };
      const next = { ...current, [field]: value };

      setSettingsMap((prev) => ({
        ...prev,
        [ref]: next,
      }));

      if (screen?.deviceId && isScreenOnline(screen.deviceId, screen.isOnline)) {
        sendIndividualThrottled(screen.deviceId, next);
      }
    },
    [isScreenOnline, screenList, sendIndividualThrottled, settingsMap]
  );

  // Commit individual screen card slider change (push socket event and persist to API)
  const handleIndividualCommit = useCallback(
    async (ref, field, value) => {
      const screen = screenList.find((s) => s.reference === ref);
      const current = settingsMap[ref] || {
        brightness: screen?.brightness ?? DEFAULT_BRIGHTNESS,
        volume: screen?.volume ?? DEFAULT_VOLUME,
        isSaving: false,
      };
      const next = { ...current, [field]: value };

      sendIndividualThrottled.cancel();
      if (screen?.deviceId && isScreenOnline(screen.deviceId, screen.isOnline)) {
        sendDeviceSettings(screen.deviceId, next);
      }

      setSettingsMap((prev) => ({
        ...prev,
        [ref]: { ...(prev[ref] || current), isSaving: true },
      }));

      try {
        await axios.post('/api/admin/screens/update-settings', {
          reference: ref,
          brightness: next.brightness,
          volume: next.volume,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not save screen settings');
      } finally {
        setSettingsMap((prev) => ({
          ...prev,
          [ref]: { ...(prev[ref] || current), isSaving: false },
        }));
      }
    },
    [isScreenOnline, screenList, sendDeviceSettings, sendIndividualThrottled, settingsMap]
  );

  // Throttled batch socket push for all selected online screens
  const sendBatchSocketThrottled = useThrottledCallback((screensToUpdate, settings) => {
    screensToUpdate.forEach((s) => {
      if (s.deviceId && isScreenOnline(s.deviceId, s.isOnline)) {
        sendDeviceSettings(s.deviceId, settings);
      }
    });
  }, SETTINGS_SEND_INTERVAL);

  // Dragging global brightness / volume sliders
  const handleGlobalChange = (field) => (_event, value) => {
    if (field === 'brightness') {
      setGlobalBrightness(value);
    } else {
      setGlobalVolume(value);
    }

    const nextSettings = {
      brightness: field === 'brightness' ? value : globalBrightness,
      volume: field === 'volume' ? value : globalVolume,
    };

    // Update state of all selected screen cards immediately for live visual feedback
    setSettingsMap((prev) => {
      const next = { ...prev };
      selectedRefs.forEach((ref) => {
        next[ref] = {
          ...(next[ref] || {}),
          [field]: value,
        };
      });
      return next;
    });

    // Throttled push to online selected screens
    sendBatchSocketThrottled(selectedScreens, nextSettings);
  };

  // Releasing global slider (push immediate socket updates and persist all selected screens to database)
  const handleGlobalCommit = (field) => async (_event, value) => {
    sendBatchSocketThrottled.cancel();

    const finalSettings = {
      brightness: field === 'brightness' ? value : globalBrightness,
      volume: field === 'volume' ? value : globalVolume,
    };

    // Push immediate socket updates to all online selected screens
    selectedScreens.forEach((s) => {
      if (s.deviceId && isScreenOnline(s.deviceId, s.isOnline)) {
        sendDeviceSettings(s.deviceId, finalSettings);
      }
    });

    if (selectedScreens.length === 0) return;

    setIsSavingBatch(true);
    setSettingsMap((prev) => {
      const next = { ...prev };
      selectedRefs.forEach((ref) => {
        next[ref] = {
          ...(next[ref] || {}),
          isSaving: true,
        };
      });
      return next;
    });

    try {
      const results = await Promise.allSettled(
        selectedScreens.map((s) =>
          axios.post('/api/admin/screens/update-settings', {
            reference: s.reference,
            brightness: finalSettings.brightness,
            volume: finalSettings.volume,
          })
        )
      );

      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length === 0) {
        toast.success(
          `Updated settings for ${selectedScreens.length} screen${
            selectedScreens.length === 1 ? '' : 's'
          }`
        );
      } else if (failures.length === selectedScreens.length) {
        toast.error('Failed to update settings for selected screens');
      } else {
        toast.success(
          `Updated ${selectedScreens.length - failures.length} of ${selectedScreens.length} screens`
        );
      }
    } catch {
      toast.error('Failed to save batch settings');
    } finally {
      setIsSavingBatch(false);
      setSettingsMap((prev) => {
        const next = { ...prev };
        selectedRefs.forEach((ref) => {
          next[ref] = {
            ...(next[ref] || {}),
            isSaving: false,
          };
        });
        return next;
      });
    }
  };

  return (
    <>
      <Head>
        <title>Screen Settings | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          pb: selectedRefs.size > 0 ? 22 : 8,
          transition: 'padding-bottom 0.3s ease',
        }}
      >
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
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
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

            {/* Search & Batch Select Bar */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
              <Button
                variant={isAllVisibleSelected ? 'contained' : 'outlined'}
                color={isAllVisibleSelected ? 'primary' : 'inherit'}
                startIcon={isAllVisibleSelected ? <Deselect /> : <SelectAll />}
                onClick={handleToggleSelectAllVisible}
                sx={{ whiteSpace: 'nowrap', minWidth: 160, height: 53 }}
              >
                {isAllVisibleSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </Stack>

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
                  const isSelected = selectedRefs.has(screen.reference);
                  const currentSettings = settingsMap[screen.reference] || {
                    brightness: screen.brightness ?? DEFAULT_BRIGHTNESS,
                    volume: screen.volume ?? DEFAULT_VOLUME,
                    isSaving: false,
                  };

                  return (
                    <Grid xs={12} sm={6} lg={4} key={screen.id || screen.reference}>
                      <ScreenCard
                        screen={screen}
                        isOnline={isOnline}
                        isConnected={isConnected}
                        isSelected={isSelected}
                        brightness={currentSettings.brightness}
                        volume={currentSettings.volume}
                        isSaving={currentSettings.isSaving}
                        onToggleSelect={() => handleToggleSelect(screen.reference)}
                        onChange={(field, val) =>
                          handleIndividualChange(screen.reference, field, val)
                        }
                        onCommit={(field, val) =>
                          handleIndividualCommit(screen.reference, field, val)
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Floating Bottom Action Bar for Global Brightness & Volume Control */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, lg: `calc(${SIDE_NAV_WIDTH}px + 24px)` },
          right: { xs: 16, sm: 24 },
          display: 'flex',
          justifyContent: 'center',
          zIndex: (theme) => theme.zIndex.appBar + 1,
          pointerEvents: 'none',
        }}
      >
        <Slide direction="up" in={selectedRefs.size > 0} mountOnEnter unmountOnExit>
          <Paper
            elevation={12}
            sx={{
              pointerEvents: 'auto',
              width: '100%',
              maxWidth: 900,
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2.5,
              backdropFilter: 'blur(16px)',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(18, 24, 38, 0.95)'
                  : 'rgba(255, 255, 255, 0.96)',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) => theme.shadows[16],
            }}
          >
            <Stack spacing={2}>
              {/* Toolbar Header Row */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
                flexWrap="wrap"
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    icon={<Tune sx={{ fontSize: '18px !important' }} />}
                    label={`${selectedRefs.size} Screen${selectedRefs.size === 1 ? '' : 's'} Selected`}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                  {isSavingBatch && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Saving changes...
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    startIcon={isAllVisibleSelected ? <Deselect /> : <SelectAll />}
                    onClick={handleToggleSelectAllVisible}
                  >
                    {isAllVisibleSelected ? 'Deselect Visible' : 'Select All Visible'}
                  </Button>
                  <Tooltip title="Clear selection">
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<Close />}
                      onClick={handleClearSelection}
                    >
                      Clear
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>

              <Divider />

              {/* Global Sliders Row */}
              <Grid container spacing={3} alignItems="center">
                {/* Global Brightness Slider */}
                <Grid xs={12} md={6}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BrightnessMedium fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Global Brightness
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {globalBrightness}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={globalBrightness}
                      min={BRIGHTNESS_MIN}
                      max={100}
                      valueLabelDisplay="auto"
                      onChange={handleGlobalChange('brightness')}
                      onChangeCommitted={handleGlobalCommit('brightness')}
                      sx={{ py: 1 }}
                    />
                  </Stack>
                </Grid>

                {/* Global Volume Slider */}
                <Grid xs={12} md={6}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        {globalVolume > 0 ? (
                          <VolumeUp fontSize="small" color="primary" />
                        ) : (
                          <VolumeDown fontSize="small" color="action" />
                        )}
                        <Typography variant="subtitle2" fontWeight={600}>
                          Global Volume
                        </Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {globalVolume}%
                      </Typography>
                    </Stack>
                    <Slider
                      value={globalVolume}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      onChange={handleGlobalChange('volume')}
                      onChangeCommitted={handleGlobalCommit('volume')}
                      sx={{ py: 1 }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Slide>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const ScreenCard = React.memo(function ScreenCard({
  screen,
  isOnline,
  isConnected,
  isSelected,
  brightness,
  volume,
  isSaving,
  onToggleSelect,
  onChange,
  onCommit,
}) {
  return (
    <Card
      onClick={onToggleSelect}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: (theme) =>
          `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
        backgroundColor: (theme) =>
          isSelected
            ? theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.08)'
              : 'rgba(99, 102, 241, 0.04)'
            : 'background.paper',
        boxShadow: (theme) => (isSelected ? theme.shadows[6] : theme.shadows[1]),
        '&:hover': {
          boxShadow: (theme) => theme.shadows[8],
          borderColor: (theme) =>
            isSelected ? theme.palette.primary.main : theme.palette.grey[400],
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
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            onClick={(e) => e.stopPropagation()}
          >
            <Chip
              size="small"
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'default'}
              variant={isOnline ? 'filled' : 'outlined'}
            />
            <Checkbox
              checked={isSelected}
              onChange={onToggleSelect}
              color="primary"
              inputProps={{ 'aria-label': `Select ${screen.screenName}` }}
            />
          </Stack>
        }
      />
      <Divider />
      <CardContent
        sx={{ flexGrow: 1 }}
        onClick={(e) => {
          // Prevent slider drag or input click from toggling card selection
          e.stopPropagation();
        }}
      >
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
              onChange={(_e, val) => onChange('brightness', val)}
              onChangeCommitted={(_e, val) => onCommit('brightness', val)}
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
              onChange={(_e, val) => onChange('volume', val)}
              onChangeCommitted={(_e, val) => onCommit('volume', val)}
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
            {isSaving ? (
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
});

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
