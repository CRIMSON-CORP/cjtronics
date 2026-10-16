import {
  Campaign,
  CheckCircle,
  Close,
  Code,
  Deselect,
  Edit,
  InsertDriveFile,
  Monitor,
  Movie,
  Refresh,
  Search,
  SelectAll,
  Upload,
  WarningAmber,
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
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Unstable_Grid2 as Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slide,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { nanoid } from 'nanoid';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import useDeviceSocket from 'src/hooks/useDeviceSocket';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import handleGSSPError from 'src/utils/handle-gssp-error';

const superAdminRef = process.env.NEXT_PUBLIC_SUPER_ADMIN_ORGANIZATION_REF;
const SIDE_NAV_WIDTH = 305;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
];

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getAdFileSize(fileItem) {
  if (fileItem.file instanceof File) return fileItem.file.size;
  return new Blob([fileItem.iframeContent || '']).size;
}

const Page = ({ organizations, screens, layouts }) => {
  const router = useRouter();
  const { user } = useAuth();
  const defaultOrganizationReference = user?.organizationReference || '';
  const isSuperAdmin = defaultOrganizationReference === superAdminRef;

  // Selected organization for upload submission
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    defaultOrganizationReference
  );

  const screenList = useMemo(() => screens?.screen || [], [screens?.screen]);
  const layoutsList = useMemo(() => layouts || [], [layouts]);
  const { isScreenOnline } = useDeviceSocket();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected screen references: Set of screen.reference
  const [selectedScreenRefs, setSelectedScreenRefs] = useState(() => new Set());

  // Cached Ad Accounts map: screen.reference -> Array of ad accounts
  const [adAccountsByScreen, setAdAccountsByScreen] = useState({});
  const [loadingScreenAccounts, setLoadingScreenAccounts] = useState({});

  // Selected Ad Account names: Set of string names (e.g. "Coca-Cola")
  const [selectedAccountNames, setSelectedAccountNames] = useState(() => new Set());

  // Staged media files
  const [stagedFiles, setStagedFiles] = useState([]);

  // Campaign creation toggle & fields (blank defaults as requested)
  const [createCampaignEnabled, setCreateCampaignEnabled] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [selectedLayoutId, setSelectedLayoutId] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [playDuration, setPlayDuration] = useState(15);

  // Auto-select first layout once layouts load if none chosen
  useEffect(() => {
    if (!selectedLayoutId && layoutsList.length > 0) {
      setSelectedLayoutId(layoutsList[0].reference || '');
    }
  }, [layoutsList, selectedLayoutId]);

  // Upload submission state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dialog state for HTML Tag snippets
  const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false);
  const [htmlSnippetName, setHtmlSnippetName] = useState('');
  const [htmlSnippetContent, setHtmlSnippetContent] = useState('');

  // Dialog state for renaming a staged file
  const [fileToRename, setFileToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Fetch ad accounts for a specific screen (quiet background fetch)
  const fetchAdAccounts = useCallback(
    async (screenRef) => {
      if (!screenRef) return;
      if (adAccountsByScreen[screenRef] || loadingScreenAccounts[screenRef]) return;

      setLoadingScreenAccounts((prev) => ({ ...prev, [screenRef]: true }));
      try {
        const response = await axios.get(
          `/api/admin/ad-account/get-by-screen?reference=${screenRef}`
        );
        const list = response.data?.data?.list || [];
        setAdAccountsByScreen((prev) => ({ ...prev, [screenRef]: list }));
      } catch (err) {
        console.error(`Failed to fetch ad accounts for screen ${screenRef}:`, err);
      } finally {
        setLoadingScreenAccounts((prev) => ({ ...prev, [screenRef]: false }));
      }
    },
    [adAccountsByScreen, loadingScreenAccounts]
  );

  // Filtered screens by search query
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

  const visibleRefs = useMemo(() => filteredScreens.map((s) => s.reference), [filteredScreens]);
  const isAllVisibleSelected =
    visibleRefs.length > 0 && visibleRefs.every((ref) => selectedScreenRefs.has(ref));

  // Toggle selection for a single screen card
  const handleToggleSelect = useCallback(
    (screenRef) => {
      setSelectedScreenRefs((prev) => {
        const next = new Set(prev);
        if (next.has(screenRef)) {
          next.delete(screenRef);
        } else {
          next.add(screenRef);
          fetchAdAccounts(screenRef);
        }
        return next;
      });
    },
    [fetchAdAccounts]
  );

  // Toggle "Select All Visible"
  const handleToggleSelectAllVisible = useCallback(() => {
    if (isAllVisibleSelected) {
      setSelectedScreenRefs((prev) => {
        const next = new Set(prev);
        visibleRefs.forEach((ref) => next.delete(ref));
        return next;
      });
    } else {
      setSelectedScreenRefs((prev) => {
        const next = new Set(prev);
        visibleRefs.forEach((ref) => {
          next.add(ref);
          fetchAdAccounts(ref);
        });
        return next;
      });
    }
  }, [fetchAdAccounts, isAllVisibleSelected, visibleRefs]);

  const handleClearSelection = useCallback(() => {
    setSelectedScreenRefs(new Set());
  }, []);

  // Aggregated Ad Accounts across all currently selected screens
  const { aggregatedAccounts, hasAnyLoadingAccounts } = useMemo(() => {
    const selectedList = screenList.filter((s) => selectedScreenRefs.has(s.reference));
    const anyLoading = selectedList.some((s) => loadingScreenAccounts[s.reference]);

    const accountMap = new Map();

    selectedList.forEach((screen) => {
      const accounts = adAccountsByScreen[screen.reference] || [];
      accounts.forEach((acc) => {
        const accName = (acc.name || '').trim();
        if (!accName) return;
        if (!accountMap.has(accName)) {
          accountMap.set(accName, {
            name: accName,
            screens: [],
          });
        }
        accountMap.get(accName).screens.push({
          screenRef: screen.reference,
          screenName: screen.screenName || screen.screenId,
          accountRef: acc.reference,
        });
      });
    });

    const aggregated = Array.from(accountMap.values()).map((item) => {
      const presentScreenRefs = new Set(item.screens.map((s) => s.screenRef));
      const missingScreens = selectedList.filter((s) => !presentScreenRefs.has(s.reference));
      return {
        name: item.name,
        screens: item.screens,
        matchingCount: item.screens.length,
        totalCount: selectedList.length,
        missingScreens,
      };
    });

    return {
      aggregatedAccounts: aggregated,
      hasAnyLoadingAccounts: anyLoading,
    };
  }, [screenList, selectedScreenRefs, adAccountsByScreen, loadingScreenAccounts]);

  // Auto-select initial ad account if exactly 1 exists and none are selected yet
  useEffect(() => {
    if (selectedAccountNames.size === 0 && aggregatedAccounts.length === 1) {
      setSelectedAccountNames(new Set([aggregatedAccounts[0].name]));
    }
  }, [aggregatedAccounts, selectedAccountNames.size]);

  // Toggle selection of an ad account name
  const handleToggleAccountName = (accountName) => {
    setSelectedAccountNames((prev) => {
      const next = new Set(prev);
      if (next.has(accountName)) {
        next.delete(accountName);
      } else {
        next.add(accountName);
      }
      return next;
    });
  };

  const handleSelectAllAccountNames = () => {
    if (selectedAccountNames.size === aggregatedAccounts.length) {
      setSelectedAccountNames(new Set());
    } else {
      setSelectedAccountNames(new Set(aggregatedAccounts.map((a) => a.name)));
    }
  };

  // Toggle days of the week
  const handleToggleDay = (dayValue) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSelectAllDays = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays(DAYS_OF_WEEK.map((d) => d.value));
    }
  };

  // Compute active upload targets (pairs of screenRef + accountRef)
  const uploadTargets = useMemo(() => {
    const targets = [];
    const seen = new Set();

    aggregatedAccounts.forEach((agg) => {
      if (selectedAccountNames.has(agg.name)) {
        agg.screens.forEach((target) => {
          const key = `${target.screenRef}:${target.accountRef}`;
          if (!seen.has(key)) {
            seen.add(key);
            targets.push({
              screenRef: target.screenRef,
              screenName: target.screenName,
              accountRef: target.accountRef,
              accountName: agg.name,
            });
          }
        });
      }
    });

    return targets;
  }, [aggregatedAccounts, selectedAccountNames]);

  // Handle multi-file picker selection
  const handleFileSelectChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 5MB limit and was skipped.`);
        continue;
      }
      const isVideo =
        file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name);
      const isImage =
        file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);

      if (!isVideo && !isImage) {
        toast.error(`"${file.name}" is not a recognized picture or video file.`);
        continue;
      }

      const type = isVideo ? 'video' : 'image';
      const previewUrl = URL.createObjectURL(file);
      const defaultName = file.name.replace(/\.[^/.]+$/, '');

      validFiles.push({
        id: nanoid(6),
        file,
        type,
        name: defaultName,
        iframeContent: '',
        previewUrl,
        size: file.size,
        idempotencyKey: nanoid(),
      });
    }

    if (validFiles.length > 0) {
      setStagedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file${validFiles.length === 1 ? '' : 's'}`);
    }

    e.target.value = '';
  };

  // Handle HTML snippet addition
  const handleAddHtmlSnippet = () => {
    if (!htmlSnippetName.trim()) {
      toast.error('Please enter an ad name');
      return;
    }
    if (!htmlSnippetContent.trim()) {
      toast.error('Please provide the HTML tag / iframe code');
      return;
    }

    const newAd = {
      id: nanoid(6),
      file: null,
      type: 'html',
      name: htmlSnippetName.trim(),
      iframeContent: htmlSnippetContent.trim(),
      previewUrl: '',
      size: new Blob([htmlSnippetContent.trim()]).size,
      idempotencyKey: nanoid(),
    };

    setStagedFiles((prev) => [...prev, ...newAd]);
    setHtmlSnippetName('');
    setHtmlSnippetContent('');
    setIsHtmlDialogOpen(false);
    toast.success('Added HTML ad snippet');
  };

  // Handle removing a staged file
  const handleRemoveStagedFile = (id) => {
    setStagedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Handle renaming a staged file
  const handleOpenRename = (fileItem) => {
    setFileToRename(fileItem);
    setRenameValue(fileItem.name);
  };

  const handleSaveRename = () => {
    if (!fileToRename || !renameValue.trim()) return;
    setStagedFiles((prev) =>
      prev.map((f) => (f.id === fileToRename.id ? { ...f, name: renameValue.trim() } : f))
    );
    setFileToRename(null);
    setRenameValue('');
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [stagedFiles]);

  // Execute upload & optional campaign creation
  const handleUpload = async () => {
    if (uploadTargets.length === 0 || stagedFiles.length === 0) return;

    if (!isSuperAdmin && !selectedOrganizationId) {
      toast.error('Organization is required');
      return;
    }

    // Validate campaign fields if enabled
    if (createCampaignEnabled) {
      if (!campaignTitle.trim()) {
        toast.error('Please enter a Campaign Title');
        return;
      }
      if (!selectedLayoutId) {
        toast.error('Please select a Screen Layout');
        return;
      }
      if (!startDateTime || !endDateTime) {
        toast.error('Please select both Start and End Date & Time for the campaign');
        return;
      }
      if (startDateTime >= endDateTime) {
        toast.error('Start Date & Time must be earlier than End Date & Time');
        return;
      }
      if (selectedDays.length === 0) {
        toast.error('Please select at least one day of the week for the campaign');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadJobs = [];
    stagedFiles.forEach((fileItem) => {
      uploadTargets.forEach((target) => {
        uploadJobs.push({
          file: fileItem,
          target,
          idempotencyKey: `${fileItem.idempotencyKey}-${target.screenRef}-${target.accountRef}`,
        });
      });
    });

    const totalBytes = uploadJobs.reduce((sum, job) => sum + getAdFileSize(job.file), 0);
    const loadedPerJob = new Array(uploadJobs.length).fill(0);

    const loadingToastId = toast.loading(
      `Uploading ${stagedFiles.length} ad${stagedFiles.length === 1 ? '' : 's'} across ${
        uploadTargets.length
      } target${uploadTargets.length === 1 ? '' : 's'}...`
    );

    try {
      // 1. Submit all ad creative uploads
      const results = await Promise.allSettled(
        uploadJobs.map((job, idx) => {
          const formData = new FormData();
          formData.append('organizationId', selectedOrganizationId);
          formData.append('screenId', job.target.screenRef);
          formData.append('adsAccountId', job.target.accountRef);
          formData.append('adsType', job.file.type);
          formData.append('adsUpload', job.file.iframeContent || job.file.file);
          formData.append('adsName', job.file.name);

          return axios.post(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/v1/ads/create`, formData, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'idempotency-key': job.idempotencyKey,
            },
            onUploadProgress: (progressEvent) => {
              loadedPerJob[idx] = progressEvent.loaded;
              if (totalBytes > 0) {
                const currentTotal = loadedPerJob.reduce((a, b) => a + b, 0);
                setUploadProgress(Math.min((currentTotal / totalBytes) * 100, 100));
              }
            },
          });
        })
      );

      const rejectedJobs = uploadJobs.filter((_, idx) => results[idx].status === 'rejected');

      if (rejectedJobs.length > 0) {
        toast.dismiss(loadingToastId);
        const failedFileIds = new Set(rejectedJobs.map((j) => j.file.id));
        const successfulFiles = stagedFiles.filter((f) => !failedFileIds.has(f.id));
        successfulFiles.forEach((f) => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });

        // Retain only files that had at least one rejection for retry
        setStagedFiles((prev) => prev.filter((f) => failedFileIds.has(f.id)));

        const successCount = uploadJobs.length - rejectedJobs.length;
        toast.error(
          `${successCount} of ${uploadJobs.length} uploads succeeded. ${rejectedJobs.length} failed. Campaign creation was held until ads retry.`
        );
        return;
      }

      // Map: targetKey (screenRef:accountRef) -> Array of created ad references/IDs
      const adRefsByTarget = {};
      uploadJobs.forEach((job, idx) => {
        const targetKey = `${job.target.screenRef}:${job.target.accountRef}`;
        if (!adRefsByTarget[targetKey]) {
          adRefsByTarget[targetKey] = [];
        }
        const responseData = results[idx]?.value?.data?.data;
        const ref = responseData?.reference || responseData?.id;
        if (ref) {
          adRefsByTarget[targetKey].push(ref);
        }
      });

      // 2. Create Campaign(s) if enabled
      if (createCampaignEnabled) {
        toast.loading('Creating campaigns for targets...', { id: loadingToastId });

        const campaignPayloads = uploadTargets.map((target) => {
          const targetKey = `${target.screenRef}:${target.accountRef}`;
          const targetAdRefs = adRefsByTarget[targetKey] || [];

          return {
            organizationId: selectedOrganizationId,
            name: campaignTitle.trim(),
            screenId: target.screenRef,
            accountId: target.accountRef,
            layoutId: selectedLayoutId,
            layoutView: 1,
            startAt: startDateTime.toLocaleDateString(),
            endAt: endDateTime.toLocaleDateString(),
            playTimeAt: startDateTime.toLocaleTimeString(),
            endTimeAt: endDateTime.toLocaleTimeString(),
            playDays: selectedDays.join(','),
            playDuration: +playDuration,
            playFiles: targetAdRefs.join(','),
          };
        });

        const campaignResults = await Promise.allSettled(
          campaignPayloads.map((payload) => axios.post('/api/admin/campaigns/create', payload))
        );

        const failedCampaigns = campaignResults.filter((r) => r.status === 'rejected');

        toast.dismiss(loadingToastId);

        if (failedCampaigns.length === 0) {
          toast.success(
            `Uploaded ${stagedFiles.length} ad${
              stagedFiles.length === 1 ? '' : 's'
            } and created ${uploadTargets.length} campaign${
              uploadTargets.length === 1 ? '' : 's'
            } successfully!`
          );
          // Reset campaign form
          setCampaignTitle('');
          setStartDateTime(null);
          setEndDateTime(null);
          setSelectedDays([]);
          setCreateCampaignEnabled(false);
        } else {
          toast.error(
            `Ads uploaded, but ${failedCampaigns.length} of ${uploadTargets.length} campaigns failed to create.`
          );
        }
      } else {
        toast.dismiss(loadingToastId);
        toast.success(
          `All ${stagedFiles.length} ad${
            stagedFiles.length === 1 ? '' : 's'
          } uploaded successfully!`
        );
      }

      // Clear staged files and revoke previews
      stagedFiles.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setStagedFiles([]);
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const totalUploadCount = stagedFiles.length * uploadTargets.length;

  return (
    <>
      <Head>
        <title>Create Ad & Campaign | Cjtronics Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          pb: selectedScreenRefs.size > 0 ? 36 : 8,
          transition: 'padding-bottom 0.3s ease',
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            {/* Header & Stats */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={2}
            >
              <div>
                <Typography variant="h4">Create Ads & Campaigns</Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                  Select screens and ad accounts to upload creatives and deploy scheduled campaigns.
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

            {/* Organization Selector (for Super Admin) */}
            {organizations?.list?.length > 0 && (
              <Card sx={{ p: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="organization-select-label">Select Organization</InputLabel>
                  <Select
                    labelId="organization-select-label"
                    label="Select Organization"
                    value={selectedOrganizationId}
                    onChange={(e) => setSelectedOrganizationId(e.target.value)}
                    disabled={!isSuperAdmin}
                  >
                    {organizations.list.map((org) => (
                      <MenuItem value={org.reference} key={org.reference}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Card>
            )}

            {/* Search & Bulk Select Bar */}
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
                  const isSelected = selectedScreenRefs.has(screen.reference);
                  const accounts = adAccountsByScreen[screen.reference];
                  const isLoadingAccounts = !!loadingScreenAccounts[screen.reference];

                  return (
                    <Grid xs={12} sm={6} lg={4} key={screen.reference || screen.id}>
                      <ScreenCard
                        screen={screen}
                        isOnline={isOnline}
                        isSelected={isSelected}
                        accounts={accounts}
                        isLoadingAccounts={isLoadingAccounts}
                        onToggleSelect={() => handleToggleSelect(screen.reference)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Floating Bottom Action Bar */}
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
        <Slide direction="up" in={selectedScreenRefs.size > 0} mountOnEnter unmountOnExit>
          <Paper
            elevation={12}
            sx={{
              pointerEvents: 'auto',
              width: '100%',
              maxWidth: 960,
              maxHeight: '82vh',
              overflowY: 'auto',
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
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                  <Chip
                    icon={<Monitor sx={{ fontSize: '18px !important' }} />}
                    label={`${selectedScreenRefs.size} Screen${
                      selectedScreenRefs.size === 1 ? '' : 's'
                    } Selected`}
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                  {hasAnyLoadingAccounts && (
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Fetching accounts...
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

              {/* Target Ad Accounts Section */}
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  spacing={1}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    Target Ad Accounts:
                  </Typography>
                  {aggregatedAccounts.length > 1 && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={handleSelectAllAccountNames}
                      sx={{ py: 0 }}
                    >
                      {selectedAccountNames.size === aggregatedAccounts.length
                        ? 'Deselect All Accounts'
                        : 'Select All Accounts'}
                    </Button>
                  )}
                </Stack>

                {aggregatedAccounts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {hasAnyLoadingAccounts
                      ? 'Fetching ad accounts for selected screens...'
                      : 'No ad accounts found for the selected screens. Please add ad accounts for these screens first.'}
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {aggregatedAccounts.map((agg) => {
                      const isChecked = selectedAccountNames.has(agg.name);
                      const isPartial = agg.matchingCount < agg.totalCount;

                      return (
                        <Tooltip
                          key={agg.name}
                          title={
                            isPartial
                              ? `Missing on ${agg.missingScreens.length} screen(s): ${agg.missingScreens
                                  .map((s) => s.screenName || s.screenId)
                                  .join(
                                    ', '
                                  )}. Ads will only upload to the ${agg.matchingCount} matching screen(s).`
                              : `Available on all ${agg.matchingCount} selected screens`
                          }
                          arrow
                        >
                          <Chip
                            clickable
                            onClick={() => handleToggleAccountName(agg.name)}
                            color={isChecked ? 'primary' : 'default'}
                            variant={isChecked ? 'filled' : 'outlined'}
                            icon={
                              isPartial ? (
                                <WarningAmber sx={{ fontSize: '18px !important' }} />
                              ) : (
                                <CheckCircle sx={{ fontSize: '18px !important' }} />
                              )
                            }
                            label={`${agg.name} (${agg.matchingCount}/${agg.totalCount} screens)`}
                            sx={{ fontWeight: 500 }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Stack>
                )}
              </Stack>

              <Divider />

              {/* Campaign Creation Toggle */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={createCampaignEnabled}
                      onChange={(e) => setCreateCampaignEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Campaign
                        fontSize="small"
                        color={createCampaignEnabled ? 'primary' : 'action'}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Also create campaign for these ads
                      </Typography>
                    </Stack>
                  }
                />
                {createCampaignEnabled && (
                  <Typography variant="caption" color="text.secondary">
                    Will create a campaign for each target screen & ad account with the schedule
                    below
                  </Typography>
                )}
              </Stack>

              {/* Collapsible Campaign Fields */}
              <Collapse in={createCampaignEnabled} unmountOnExit>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  }}
                >
                  <Stack spacing={2.5}>
                    <Grid container spacing={2}>
                      {/* Campaign Title */}
                      <Grid xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Campaign Title"
                          placeholder="e.g. Summer Promo 2026"
                          value={campaignTitle}
                          onChange={(e) => setCampaignTitle(e.target.value)}
                          required
                        />
                      </Grid>

                      {/* Screen Layout Selector */}
                      <Grid xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="campaign-layout-label">Screen Layout</InputLabel>
                          <Select
                            labelId="campaign-layout-label"
                            label="Screen Layout"
                            value={selectedLayoutId}
                            onChange={(e) => setSelectedLayoutId(e.target.value)}
                          >
                            {layoutsList.map((layout) => (
                              <MenuItem
                                value={layout.reference}
                                key={layout.reference || layout.id}
                              >
                                {layout.layout || layout.name || layout.reference}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Start Date & Time Picker */}
                      <Grid xs={12} sm={6}>
                        <DateTimePicker
                          label="Start Date & Time"
                          value={startDateTime}
                          onChange={setStartDateTime}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: 'Select start date & time',
                            },
                          }}
                        />
                      </Grid>

                      {/* End Date & Time Picker */}
                      <Grid xs={12} sm={6}>
                        <DateTimePicker
                          label="End Date & Time"
                          value={endDateTime}
                          onChange={setEndDateTime}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: 'Select end date & time',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Days of the Week Selection */}
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Play Days:
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={handleSelectAllDays}
                          sx={{ py: 0 }}
                        >
                          {selectedDays.length === DAYS_OF_WEEK.length
                            ? 'Deselect All Days'
                            : 'Select Everyday'}
                        </Button>
                      </Stack>
                      <FormGroup row sx={{ gap: 0.5 }}>
                        {DAYS_OF_WEEK.map((day) => (
                          <FormControlLabel
                            key={day.value}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedDays.includes(day.value)}
                                onChange={() => handleToggleDay(day.value)}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {day.label}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Stack>

                    {/* Play Duration Slider */}
                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          Play Duration per Item:
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                          {playDuration} seconds
                        </Typography>
                      </Stack>
                      <Slider
                        value={playDuration}
                        onChange={(_e, val) => setPlayDuration(val)}
                        min={1}
                        max={60}
                        valueLabelDisplay="auto"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Collapse>

              <Divider />

              {/* Staged Files Horizontal Scroll Row (if any) */}
              {stagedFiles.length > 0 && (
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Staged Files ({stagedFiles.length}):
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      overflowX: 'auto',
                      pb: 1,
                      pt: 0.5,
                      '&::-webkit-scrollbar': { height: 6 },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: 3,
                      },
                    }}
                  >
                    {stagedFiles.map((fileItem) => (
                      <Paper
                        key={fileItem.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          minWidth: 220,
                          maxWidth: 240,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.03)'
                              : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 1,
                              overflow: 'hidden',
                              backgroundColor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {fileItem.type === 'image' && fileItem.previewUrl ? (
                              <Image
                                width={44}
                                height={44}
                                src={fileItem.previewUrl}
                                alt="preview"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : fileItem.type === 'video' && fileItem.previewUrl ? (
                              <Movie color="primary" />
                            ) : fileItem.type === 'html' ? (
                              <Code color="secondary" />
                            ) : (
                              <InsertDriveFile color="action" />
                            )}
                          </Box>
                          <Stack sx={{ overflow: 'hidden', flexGrow: 1 }}>
                            <Tooltip title={fileItem.name}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {fileItem.name}
                              </Typography>
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">
                              {fileItem.type === 'html'
                                ? 'HTML Snippet'
                                : formatFileSize(fileItem.size)}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 'auto' }}
                        >
                          <Chip
                            size="small"
                            label={fileItem.type.toUpperCase()}
                            variant="outlined"
                          />
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRename(fileItem)}
                              disabled={isUploading}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStagedFile(fileItem.id)}
                              disabled={isUploading}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Box>
                </Stack>
              )}

              {/* Action Buttons & Submit Row */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    disabled={isUploading}
                  >
                    Add Picture / Video
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelectChange}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Code />}
                    onClick={() => setIsHtmlDialogOpen(true)}
                    disabled={isUploading}
                  >
                    Add HTML Snippet
                  </Button>
                </Stack>

                <Button
                  size="large"
                  variant="contained"
                  onClick={handleUpload}
                  disabled={
                    isUploading ||
                    stagedFiles.length === 0 ||
                    uploadTargets.length === 0 ||
                    (!isSuperAdmin && !selectedOrganizationId)
                  }
                  sx={{
                    isolation: 'isolate',
                    overflow: 'hidden',
                    position: 'relative',
                    minWidth: 240,
                    fontWeight: 600,
                  }}
                  endIcon={
                    isUploading && (
                      <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                    )
                  }
                >
                  {isUploading
                    ? `Uploading (${Math.round(uploadProgress)}%)...`
                    : stagedFiles.length === 0
                      ? 'Add Files to Upload'
                      : uploadTargets.length === 0
                        ? 'Select an Ad Account'
                        : createCampaignEnabled
                          ? `Upload & Create Campaign (${totalUploadCount} Targets)`
                          : `Upload ${stagedFiles.length} Ad${stagedFiles.length === 1 ? '' : 's'} (${totalUploadCount} Target${totalUploadCount === 1 ? '' : 's'})`}
                  {isUploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        zIndex: -1,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        transition: 'width 0.2s ease-out',
                        width: `${uploadProgress}%`,
                      }}
                    />
                  )}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Slide>
      </Box>

      {/* Dialog for Adding HTML Snippet */}
      <Dialog
        open={isHtmlDialogOpen}
        onClose={() => setIsHtmlDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add HTML Tag / Iframe Ad</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Ad Name"
              fullWidth
              value={htmlSnippetName}
              onChange={(e) => setHtmlSnippetName(e.target.value)}
              placeholder="e.g. Summer Promo Widget"
            />
            <TextField
              label="Iframe / HTML Content"
              fullWidth
              multiline
              rows={4}
              value={htmlSnippetContent}
              onChange={(e) => setHtmlSnippetContent(e.target.value)}
              placeholder="<iframe src='...' width='100%' height='100%'></iframe>"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsHtmlDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddHtmlSnippet}>
            Add Snippet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Renaming a Staged File */}
      <Dialog open={!!fileToRename} onClose={() => setFileToRename(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Ad File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Ad Name"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileToRename(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRename}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const ScreenCard = React.memo(function ScreenCard({
  screen,
  isOnline,
  isSelected,
  accounts,
  isLoadingAccounts,
  onToggleSelect,
}) {
  const accountCount = accounts?.length || 0;
  const isLandscape = (screen.screenWidth || 0) >= (screen.screenHeight || 0);

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
              ? `${screen.screenWidth} × ${screen.screenHeight} px (${
                  isLandscape ? 'Landscape' : 'Portrait'
                })`
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
      <CardContent sx={{ py: 1.5, px: 2, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Ad Accounts
          </Typography>
          {isLoadingAccounts ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CircularProgress size={12} />
              <Typography variant="caption" color="text.secondary">
                Loading...
              </Typography>
            </Stack>
          ) : accounts ? (
            <Chip
              size="small"
              variant={accountCount > 0 ? 'outlined' : 'filled'}
              color={accountCount > 0 ? 'primary' : 'default'}
              label={`${accountCount} Account${accountCount === 1 ? '' : 's'}`}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Select card to load
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});

export const getServerSideProps = async (ctx) => {
  try {
    const [organizations, screens, layouts] = await Promise.all([
      getResourse(ctx.req, '/organization'),
      getResourse(ctx.req, '/screen', { size: 1000 }),
      getResourse(ctx.req, 'screen/layout/all'),
    ]);
    return {
      props: {
        organizations,
        screens,
        layouts: layouts || [],
      },
    };
  } catch (error) {
    return handleGSSPError(error, ctx);
  }
};
