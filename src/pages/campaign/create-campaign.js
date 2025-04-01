import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Unstable_Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Iframe from 'src/components/Iframe';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import * as Yup from 'yup';
import { screenLayoutToReferenceMap } from '../screens';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Close, DragIndicator, Replay, Upload } from '@mui/icons-material';
import Image from 'next/image';
import { nanoid } from 'nanoid';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import ConfirmAction from 'src/components/ConfirmAction';
import useToggle from 'src/hooks/useToggle';

const superAdminRef = process.env.NEXT_PUBLIC_SUPER_ADMIN_ORGANIZATION_REF;
const Page = ({ screens, organizations, layouts }) => {
  const { user } = useAuth();
  const { push } = useRouter();
  const defaultOrganizationReference = user?.organizationReference || '';
  const isSuperAdmin = defaultOrganizationReference === superAdminRef;

  const [adAccounts, setAdAccounts] = useState([]);
  const [fetchingAdAccounts, setFetchingAdAccounts] = useState(false);

  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      name: '',
      screenId: '',
      accountId: '',
      layoutId: '',
      layoutView: '1',
      startAt: null,
      endAt: null,
      playTimeAt: null,
      endTimeAt: null,
      playDays: '',
      playDuration: 1,
      playFiles: '',
    },
    validationSchema: Yup.object({
      ...(isSuperAdmin
        ? {}
        : { organizationId: Yup.string().required('Organization is required') }),
      name: Yup.string().max(255).required('Campaign name is required'),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      accountId: Yup.string().max(255).required('Ad Account name is required'),
      startAt: Yup.string().max(255).required('Start Date is required'),
      endAt: Yup.string().max(255).required('End Date name is required'),
      playTimeAt: Yup.string().max(255).required('Start time name is required'),
      endTimeAt: Yup.string().max(255).required('End Time name is required'),
      playDays: Yup.string().max(255).required('Select at Least one Day to play Ads'),
      playFiles: Yup.string().max(255).required('Select at Least one Ad File'),
    }),
    onSubmit: async (values, helpers) => {
      const payload = { ...values };
      payload.layoutView = +payload.layoutView;
      payload.startAt = payload.startAt.toLocaleDateString();
      payload.endAt = payload.endAt.toLocaleDateString();
      payload.playTimeAt = payload.playTimeAt.toLocaleTimeString();
      payload.endTimeAt = payload.endTimeAt.toLocaleTimeString();
      helpers.setSubmitting(true);
      await toast.promise(axios.post('/api/admin/campaigns/create', payload), {
        loading: 'Creating Campaign, Hang on...',
        success: (response) => {
          helpers.resetForm();
          push(`/campaign/campaign-schedule/${values.screenId}`);
          return response.data.message || 'Campaign created successfully';
        },
        error: (error) => error.response?.data?.message || error.message,
      });
      helpers.setSubmitting(false);
    },
  });

  const selectedScreenLayoutReference = useMemo(
    () =>
      screens.screen.find((screen) => screen.reference === formik.values.screenId)?.layoutReference,
    [formik.values.screenId]
  );

  const screenLayout = useMemo(() => {
    const selectedLyout = layouts.find(
      (layout) => layout.reference === selectedScreenLayoutReference
    );
    return selectedLyout;
  }, [selectedScreenLayoutReference]);

  useEffect(() => {
    formik.setFieldValue('layoutId', selectedScreenLayoutReference);
  }, [selectedScreenLayoutReference]);

  const handleDateTimeUpdate = useCallback((field, date) => (value) => {
    formik.setFieldValue(field, value);
  });

  useEffect(() => {
    const { startAt, endAt, playTimeAt, endTimeAt } = formik.values;

    if (startAt && endAt && playTimeAt && endTimeAt) {
      const startDateTime = new Date(
        startAt.getFullYear(),
        startAt.getMonth(),
        startAt.getDate(),
        playTimeAt.getHours(),
        playTimeAt.getMinutes(),
        playTimeAt.getSeconds()
      );

      const endDateTime = new Date(
        endAt.getFullYear(),
        endAt.getMonth(),
        endAt.getDate(),
        endTimeAt.getHours(),
        endTimeAt.getMinutes(),
        endTimeAt.getSeconds()
      );

      if (startDateTime > endDateTime) {
        formik.setFieldValue('endAt', null);
        formik.setFieldValue('endTimeAt', null);
        toast.error('Start date cannot be greater than end date');
      }
    }
  }, [
    formik.values.startAt,
    formik.values.endAt,
    formik.values.playTimeAt,
    formik.values.endTimeAt,
  ]);

  useEffect(() => {
    formik.setFieldValue('accountId', '', false);
  }, [formik.values.screenId]);

  useEffect(() => {
    formik.setFieldValue('playFiles', '');
  }, [formik.values.accountId]);

  const { screenId } = formik.values;
  const fetchAdAccounts = useCallback(async () => {
    setFetchingAdAccounts(true);
    try {
      toast.loading('Fetching Ad Accounts...');
      const response = await axios.get(`/api/admin/ad-account/get-by-screen?reference=${screenId}`);
      toast.dismiss();
      const { list } = response.data.data;
      if (list.length === 0) {
        toast.error('No Ad Accounts found for this screen');
        return;
      }
      setAdAccounts(response.data.data.list);
    } catch (error) {
      toast.error('Failed to fetch Ad accounts for this screen');
    }
    setFetchingAdAccounts(false);
  }, [screenId]);

  useEffect(() => {
    if (screenId) {
      fetchAdAccounts();
    }
  }, [screenId]);

  useEffect(() => {
    window.addEventListener('new-file-upload', fetchAdAccounts);

    return window.removeEventListener('new-file-upload', fetchAdAccounts);
  }, []);

  return (
    <>
      <Head>
        <title>Create Campaign | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <CreateAds organizations={organizations} screens={screens} />
            <Card>
              <CardHeader title="Create Campaign" />
              <CardContent>
                <form onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="organizationId">Select Organization</InputLabel>
                      <Select
                        error={!!(formik.touched.organizationId && formik.errors.organizationId)}
                        fullWidth
                        label="Select Organization"
                        name="organizationId"
                        id="organizationId"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.organizationId}
                        disabled={!isSuperAdmin}
                      >
                        {organizations.list.map((organization) => (
                          <MenuItem key={organization.id} value={organization.reference}>
                            {organization.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!(formik.touched.organizationId && formik.errors.organizationId) && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {formik.errors.organizationId}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl variant="outlined">
                      <TextField
                        error={!!(formik.touched.name && formik.errors.name)}
                        fullWidth
                        helperText={formik.touched.name && formik.errors.name}
                        label="Campaign Name"
                        name="name"
                        id="name"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        type="text"
                        value={formik.values.name}
                      />
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                      <Select
                        error={!!(formik.touched.screenId && formik.errors.screenId)}
                        labelId="scrren-select-label"
                        id="screen-select"
                        name="screenId"
                        value={formik.values.screenId}
                        label="Select Screen"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                      >
                        {screens.screen.map((screen) => (
                          <MenuItem value={screen.reference} key={screen.reference}>
                            {screen.screenName}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!(formik.touched.screenId && formik.errors.screenId) && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {formik.errors.screenId}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="screen_id">Select Ad Account</InputLabel>
                      <Select
                        error={!!(formik.touched.accountId && formik.errors.accountId)}
                        fullWidth
                        label="Select Ad Account-"
                        name="accountId"
                        id="accountId"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.accountId}
                        disabled={
                          !formik.values.screenId || adAccounts.length === 0 || fetchingAdAccounts
                        }
                        endAdornment={fetchingAdAccounts && <CircularProgress />}
                      >
                        {adAccounts.map((adAccount) => (
                          <MenuItem value={adAccount.reference} key={adAccount.reference}>
                            {adAccount.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {!!(formik.touched.accountId && formik.errors.accountId) && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {formik.errors.accountId}
                        </FormHelperText>
                      )}
                    </FormControl>
                    <AdFilesSelectWrapper formik={formik} adAccountId={formik.values.accountId} />
                    <Grid container spacing={2}>
                      <Grid xs={12} md={6}>
                        <FormControl variant="outlined" fullWidth>
                          <DatePicker
                            onChange={handleDateTimeUpdate('startAt')}
                            name="startAt"
                            label="Select Start date"
                            fullWidth
                            value={formik.values.startAt}
                          />
                          {!!(formik.touched.startAt && formik.errors.startAt) && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {formik.errors.startAt}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <FormControl variant="outlined" fullWidth>
                          <DatePicker
                            onChange={handleDateTimeUpdate('endAt')}
                            name="endAt"
                            label="Select End Date"
                            fullWidth
                            value={formik.values.endAt}
                          />
                          {!!(formik.touched.endAt && formik.errors.endAt) && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {formik.errors.endAt}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <FormControl variant="outlined" fullWidth>
                          <TimePicker
                            onChange={handleDateTimeUpdate('playTimeAt')}
                            name="playTimeAt"
                            label="Select Start Time"
                            fullWidth
                            timeSteps={{
                              minutes: 1,
                            }}
                            value={formik.values.playTimeAt}
                          />
                          {!!(formik.touched.playTimeAt && formik.errors.playTimeAt) && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {formik.errors.playTimeAt}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid xs={12} md={6}>
                        <FormControl variant="outlined" fullWidth>
                          <TimePicker
                            onChange={handleDateTimeUpdate('endTimeAt')}
                            name="endTimeAt"
                            label="Select End Time"
                            fullWidth
                            timeSteps={{
                              minutes: 1,
                            }}
                            value={formik.values.endTimeAt}
                            sx={{
                              'li:hover': {
                                backgroundColor: 'rgb(168 201 86 / 33%)',
                              },
                            }}
                          />
                          {!!(formik.touched.endTimeAt && formik.errors.endTimeAt) && (
                            <FormHelperText sx={{ color: 'error.main' }}>
                              {formik.errors.endTimeAt}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1">Layout Type</Typography>
                      <Box maxWidth={300}>
                        {screenLayoutToReferenceMap[selectedScreenLayoutReference]?.(
                          formik,
                          screenLayout,
                          { view_name: 'layoutView', view_value: formik.values.layoutView }
                        ) || <Typography>Select Screen to view layout</Typography>}
                      </Box>
                    </Stack>
                    <Stack spacing={1}>
                      <FormHelperText>
                        Play Campaign (Sunday - Saturday) choose to show campaign everyday or select
                        specific days.
                      </FormHelperText>
                      <FormGroup row>
                        <DayCheck label="Sunday" formik={formik} value="sunday" />
                        <DayCheck label="Monday" formik={formik} value="monday" />
                        <DayCheck label="Tuesday" formik={formik} value="tuesday" />
                        <DayCheck label="Wednesday" formik={formik} value="wednesday" />
                        <DayCheck label="Thursday" formik={formik} value="thursday" />
                        <DayCheck label="Friday" formik={formik} value="friday" />
                        <DayCheck label="Saturday" formik={formik} value="saturday" />
                      </FormGroup>
                    </Stack>
                    <Stack spacing={1}>
                      <FormHelperText>
                        Video and Image duration (59secs) - Media such as video uses the default
                        video duration
                      </FormHelperText>
                      <Slider
                        name="playDuration"
                        valueLabelDisplay="auto"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.playDuration}
                        min={1}
                        max={60}
                      />
                    </Stack>

                    <Button
                      type="submit"
                      startIcon={
                        formik.isSubmitting && (
                          <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                        )
                      }
                      variant="contained"
                      size="large"
                      disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                    >
                      Create campaign
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function DayCheck({ label, formik, value }) {
  const handleChange = (e) => {
    const { checked } = e.target;
    let selected_days = formik.values.playDays;

    if (checked) {
      selected_days = [...selected_days.split(',').filter(Boolean), value].join(',');
    } else {
      selected_days = selected_days
        .split(',')
        .filter((day) => day !== value)
        .filter(Boolean)
        .join(',');
    }
    formik.setFieldValue('playDays', selected_days);
  };

  return (
    <FormControlLabel
      onChange={handleChange}
      value={value}
      control={<Checkbox />}
      label={label}
      checked={formik.values.playDays.includes(value)}
    />
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [screens, organizations, layouts] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, '/organization'),
      getResourse(ctx.req, 'screen/layout/all'),
    ]);
    return {
      props: { screens, organizations, layouts },
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

function AdFilesSelectWrapper({ adAccountId, formik }) {
  const [fetchingAds, setFetchingAds] = useState(false);
  const [adFiles, setAdFiles] = useState([]);

  const fetchAdFiles = async () => {
    setAdFiles([]);
    setFetchingAds(true);
    try {
      const { data } = await axios.get(
        `/api/admin/ad-account/get-ads?ad_account_id=${adAccountId}`
      );

      setAdFiles(data.data?.adsUpload || data.data);
    } catch (error) {
      console.log(error);
    }
    setFetchingAds(false);
  };

  useEffect(() => {
    if (adAccountId) fetchAdFiles();
  }, [adAccountId]);

  if (!adAccountId) {
    return <Typography>Select Ad Account to select Ad files</Typography>;
  }

  if (fetchingAds) {
    return (
      <Stack spacing={1}>
        <Typography variant="subtitle1">Select Ad Files</Typography>
        <Grid container spacing={2}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Grid xs={12} sm={6} md={4} item key={index}>
                <Skeleton variant="rounded" width="100%" animation="wave" height={140} />
              </Grid>
            ))}
        </Grid>
        {formik.errors.playFiles && <Typography>{formik.errors.playFiles}</Typography>}
      </Stack>
    );
  }

  if (adFiles.length === 0) {
    return (
      <>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Select Ad Files</Typography>
          <Typography>No Ad files found</Typography>
        </Stack>
      </>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Select Ad Files</Typography>
      <Grid container spacing={2}>
        {adFiles.map((file) => (
          <Grid key={file.reference} xs={12} sm={6} md={4} item>
            <AdFile {...file} formik={formik} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function AdFile({ name, url, reference, type, formik }) {
  const handleChange = (e) => {
    const { checked } = e.target;
    let selected_ads = formik.values.playFiles;

    if (checked) {
      selected_ads = [...selected_ads.split(',').filter(Boolean), reference].join(',');
    } else {
      selected_ads = selected_ads
        .split(',')
        .filter((day) => day !== reference)
        .filter(Boolean)
        .join(',');
    }
    formik.setFieldValue('playFiles', selected_ads);
  };
  return (
    <Card>
      <CardHeader
        title={name}
        subheader={type}
        action={
          <FormControlLabel
            onChange={handleChange}
            value={reference}
            control={<Checkbox />}
            checked={formik.values.playFiles.includes(reference)}
          />
        }
      />
      {type === 'html' ? (
        <Iframe content={url} />
      ) : (
        <CardMedia component={adMediaTypeTagMap[type]} height="200" image={url} title={name} />
      )}
    </Card>
  );
}

const adMediaTypeTagMap = {
  image: 'img',
  video: 'video',
  html: 'iframe',
};

function CreateAds({ organizations, screens }) {
  const { user } = useAuth();
  const defaultOrganizationReference = user?.organizationReference || '';
  const isSuperAdmin = defaultOrganizationReference === superAdminRef;
  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      screenId: '',
      adsAccountId: '',
      adFiles: [],
      submit: null,
    },
    validationSchema: Yup.object({
      ...(isSuperAdmin
        ? {}
        : { organizationId: Yup.string().required('Organization is required') }),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      adsAccountId: Yup.string().max(255).required('Ad Account name is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await signIn(values.email, values.password);
        router.push(router.query.continueUrl ?? '/');
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const [adAccounts, setAdAccounts] = useState([]);
  const [fetchingAdAccounts, setFetchingAdAccounts] = useState(false);

  const { screenId } = formik.values;

  const fetchAdAccounts = useCallback(async () => {
    setFetchingAdAccounts(true);
    try {
      toast.loading('Fetching Ad Accounts...');
      const response = await axios.get(`/api/admin/ad-account/get-by-screen?reference=${screenId}`);
      toast.dismiss();
      const { list } = response.data.data;
      if (list.length === 0) {
        toast.error('No Ad Accounts found for this screen');
        return;
      }
      setAdAccounts(response.data.data.list);
    } catch (error) {
      toast.error('Failed to fetch Ad accounts for this screen');
    }
    setFetchingAdAccounts(false);
  }, [screenId]);

  useEffect(() => {
    if (screenId) {
      fetchAdAccounts();
    }
  }, [screenId]);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">Create Ad</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl variant="outlined">
              <InputLabel htmlFor="organization">Select Organization</InputLabel>
              <Select
                error={!!(formik.touched.organizationId && formik.errors.organizationId)}
                fullWidth
                label="Select Organization-"
                name="organizationId"
                id="organizationId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.organizationId}
                disabled={!isSuperAdmin}
              >
                {organizations.list.map((organization) => (
                  <MenuItem value={organization.reference} key={organization.reference}>
                    {organization.name}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.organizationId && formik.errors.organizationId) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.organizationId}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="screenId">Select Screen</InputLabel>
              <Select
                error={!!(formik.touched.screenId && formik.errors.screenId)}
                fullWidth
                id="screenId"
                name="screenId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.screenId}
                label="Select Screen"
              >
                {screens.screen.map((screen) => (
                  <MenuItem value={screen.reference} key={screen.reference}>
                    {screen.screenName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="outlined">
              <InputLabel htmlFor="screen_id">Select Ad Account</InputLabel>
              <Select
                error={!!(formik.touched.adsAccountId && formik.errors.adsAccountId)}
                fullWidth
                label="Select Ad Account-"
                name="adsAccountId"
                id="adsAccountId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.adsAccountId}
                disabled={!formik.values.screenId || adAccounts.length === 0 || fetchingAdAccounts}
                endAdornment={fetchingAdAccounts && <CircularProgress />}
              >
                {adAccounts.map((adAccount) => (
                  <MenuItem value={adAccount.reference} key={adAccount.reference}>
                    {adAccount.name}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.adsAccountId && formik.errors.adsAccountId) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.adsAccountId}
                </FormHelperText>
              )}
            </FormControl>
            <AdFiles formik={formik} />
            <UploadForm formik={formik} />
          </Stack>
        </form>
      </AccordionDetails>
    </Accordion>
  );
}

function AdFiles({ formik }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Ad Files</Typography>
      <AddedFiles formik={formik} />
      <EmptyAdForm formik={formik} />
    </Stack>
  );
}

const visualyHiddenInputStyles = {
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
};

function EmptyAdForm({ id, formik, fileType, fileName, ifrmContent, close }) {
  const [selectedAdFileType, setSelectedAdFileType] = useState(fileType || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(fileName || '');
  const [fileObjectUrl, setFileObjectUrl] = useState('');
  const [iframeContent, setIframeContent] = useState(ifrmContent || '');

  const handleAdFileTypeSelect = (e) => {
    setSelectedAdFileType(e.target.value);
  };

  const handleFileSelectChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 2MB');
      return;
    }

    setSelectedFile(file);
    setFileObjectUrl(URL.createObjectURL(file));
  };

  const handleAdFileNameChange = (e) => {
    setSelectedFileName(e.target.value);
  };

  const handleIframeContentChange = (e) => {
    setIframeContent(e.target.value);
  };

  const addAdFile = () => {
    const existingAdFiles = [...formik.values.adFiles];
    const newAdFile = {
      name: selectedFileName,
      type: selectedAdFileType,
      file: iframeContent || selectedFile,
      iframeContent,
    };
    if (id) {
      const index = existingAdFiles.findIndex((adFile) => adFile.id === id);
      existingAdFiles[index] = {
        ...existingAdFiles[index],
        ...newAdFile,
        file: newAdFile.file || existingAdFiles[index].file,
      };
    } else {
      newAdFile.id = nanoid(5);
      existingAdFiles.push(newAdFile);
    }
    formik.setFieldValue('adFiles', existingAdFiles);
    close?.();

    setSelectedAdFileType('');
    setSelectedFile(null);
    setFileObjectUrl('');
    URL.revokeObjectURL(fileObjectUrl);
    setSelectedFileName('');
    setIframeContent('');
  };

  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFileObjectUrl('');
      URL.revokeObjectURL(fileObjectUrl);
      setSelectedFileName('');
      setIframeContent('');
    };
  }, [selectedAdFileType]);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Add Ad File</Typography>
      <FormControl fullWidth>
        <InputLabel id="screenId">Select Ad Type</InputLabel>
        <Select
          fullWidth
          value={selectedAdFileType}
          label="Select Ad Type "
          onChange={handleAdFileTypeSelect}
        >
          <MenuItem value="image">Picture</MenuItem>
          <MenuItem value="video">Video</MenuItem>
          <MenuItem value="html">HTML Tags</MenuItem>
        </Select>
      </FormControl>
      {selectedAdFileType && (
        <Stack spacing={2} direction="row" sx={{ whiteSpace: 'nowrap' }}>
          {selectedFile ? (
            <Stack
              spacing={1}
              direction="row"
              border={1}
              p={0.5}
              borderColor={'grey.300'}
              borderRadius={1}
              alignItems="center"
            >
              {selectedAdFileType === 'image' && (
                <Image width={40} height={40} src={fileObjectUrl} alt="preview" />
              )}
              {selectedAdFileType === 'video' && (
                <video style={videoStyle} src={fileObjectUrl} alt="preview" />
              )}
              <Button
                component="label"
                role={undefined}
                variant="text"
                tabIndex={-1}
                startIcon={<Replay />}
              >
                Replace file
                <input
                  type="file"
                  style={visualyHiddenInputStyles}
                  onChange={handleFileSelectChange}
                  accept={selectedAdFileType === 'image' ? 'image/*' : 'video/*'}
                />
              </Button>
            </Stack>
          ) : selectedAdFileType === 'html' ? (
            <TextField
              fullWidth
              type="text"
              label="Iframe Content"
              value={iframeContent}
              onChange={handleIframeContentChange}
            />
          ) : (
            <Button
              fullWidth
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<Upload />}
            >
              Add {selectedAdFileType === 'image' ? 'Picture' : 'Video'} file
              <input
                type="file"
                style={visualyHiddenInputStyles}
                onChange={handleFileSelectChange}
                accept={selectedAdFileType === 'image' ? 'image/*' : 'video/*'}
              />
            </Button>
          )}
          <TextField
            fullWidth
            type="text"
            label="File name"
            value={selectedFileName}
            onChange={handleAdFileNameChange}
          />
        </Stack>
      )}
      {selectedAdFileType && (id ? true : selectedFile || iframeContent) && selectedFileName && (
        <Button fullWidth variant="contained" onClick={addAdFile}>
          {id ? 'Update Ad' : 'Add Ad'}
        </Button>
      )}
    </Stack>
  );
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function AddedFiles({ formik }) {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(formik.values.adFiles, result.source.index, result.destination.index);

    formik.setFieldValue('adFiles', items);
  };
  return (
    formik.values.adFiles.length > 0 && (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="ad-files">
          {(provided, snapshot) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {formik.values.adFiles.map((file, index) => (
                <Draggable draggableId={file.id} index={index} key={file.id}>
                  {(_provided) => (
                    <Box
                      ref={_provided.innerRef}
                      {..._provided.draggableProps}
                      {..._provided.dragHandleProps}
                      sx={{
                        mt: 2,
                        userSelect: 'none',
                        ..._provided.draggableProps.style,
                      }}
                    >
                      <AddedFile
                        key={index}
                        id={file.id}
                        name={file.name}
                        type={file.type}
                        file={file.file}
                        formik={formik}
                        iframeContent={file.iframeContent}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    )
  );
}

function AddedFile({ id, name, type, file, iframeContent, formik }) {
  const fileObjectUrl = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : null),
    [file]
  );

  const handleRemoveFile = () => {
    formik.setFieldValue(
      'adFiles',
      formik.values.adFiles.filter((f) => f.id !== id)
    );
    URL.revokeObjectURL(fileObjectUrl);
  };
  return (
    <Paper sx={{ p: 2 }} elevation={5}>
      <Stack
        spacing={1}
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ overflowY: 'hidden', overflowX: 'auto' }}
          spacing={1}
        >
          <Box flex="none">
            {file && type === 'image' && (
              <Image width={40} height={40} src={fileObjectUrl} alt="preview" />
            )}
            {file && type === 'video' && (
              <video style={videoStyle} src={fileObjectUrl} alt="preview" />
            )}
            {type === 'html' && <Iframe content={iframeContent} styles={videoStyle} />}
          </Box>
          <Stack maxWidth="100%" overflow="auto">
            <Typography
              variant="h6"
              width="100%"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {name}
            </Typography>
            {['image', 'video'].includes(type) && (
              <Typography variant="subtitle1">{file && formatFileSize(file.size)}</Typography>
            )}
          </Stack>
        </Stack>
        <Stack
          spacing={0.5}
          alignItems="center"
          direction="row"
          alignSelf="flex-end"
          sx={{ ml: 'auto !important' }}
        >
          <EditFile fileId={id} formik={formik} />
          <ConfirmAction
            color="error"
            buttonProps={{ color: 'error', variant: 'text' }}
            content="Are you sure you want to remove this Ad?"
            proceedText="Yes, Remove"
            title="Remove Ad?"
            action={handleRemoveFile}
          >
            Remove
          </ConfirmAction>
          <DragIndicator />
        </Stack>
      </Stack>
    </Paper>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

const cardStyles = {
  maxWidth: 700,
  maxHeight: '85vh',
  overflowY: 'auto',
};
function EditFile({ formik, fileId }) {
  const { state, open, close } = useToggle(false);

  const { id, name, type, iframeContent } = useMemo(
    () => formik.values.adFiles.find((file) => file.id === fileId),
    [fileId]
  );

  return (
    <>
      <Button onClick={open}>Edit</Button>
      <Modal open={state} onClose={close}>
        <Box sx={modalStyles}>
          <Card sx={cardStyles}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5">Edit Ad File</Typography>
                  <IconButton onClick={close}>
                    <Close />
                  </IconButton>
                </Stack>
              }
            />
            <CardContent>
              <EmptyAdForm
                {...{
                  id,
                  formik,
                  fileType: type,
                  fileName: name,
                  ifrmContent: iframeContent,
                  close,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}

const uploadButtonStyle = {
  isolation: 'isolate',
  overflow: 'hidden',
};

const progressSpanStyles = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: -1,
  background: 'rgba(0, 0, 0, 0.5)',
  left: 0,
  height: '100%',
  transition: 'width 0.3s ease-out',
};

function UploadForm({ formik }) {
  const [uploadProgress, setuploadProgress] = useState(0);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const { user } = useAuth();

  const hanldeUpload = () => {
    const formData = new FormData();
    const { organizationId, screenId, adsAccountId, adFiles } = formik.values;
    formData.append('organizationId', organizationId);
    formData.append('screenId', screenId);
    formData.append('adsAccountId', adsAccountId);

    adFiles.forEach((file) => {
      formData.append(`adsType[]`, file.type);
      formData.append(`adsUpload[]`, file.iframeContent || file.file);
      formData.append(`adsName[]`, file.name);
    });

    setRequestProcessing(true);

    toast.promise(
      axios.post(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/v1/ads/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          setuploadProgress((loaded / total) * 100);
        },
      }),
      {
        loading: 'Uploading Ads, Hang on...',
        success: (response) => {
          formik.resetForm();
          setuploadProgress(0);
          setRequestProcessing(false);
          const newAddUploadEvent = new CustomEvent('new-file-upload');
          window.dispatchEvent(newAddUploadEvent);
          return response.data.message || 'Ads uploaded successfully';
        },
        error: (err) => {
          setRequestProcessing(false);
          setuploadProgress(0);
          return err.response?.data?.message || err.message;
        },
      }
    );
  };

  return (
    <Button
      size="large"
      variant="contained"
      sx={uploadButtonStyle}
      onClick={hanldeUpload}
      endIcon={
        requestProcessing && <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
      }
      disabled={
        !(formik.isValid && formik.dirty) || requestProcessing || formik.values.adFiles.length === 0
      }
    >
      Submit
      <Box style={{ ...progressSpanStyles, width: `${uploadProgress}%` }}></Box>
    </Button>
  );
}
