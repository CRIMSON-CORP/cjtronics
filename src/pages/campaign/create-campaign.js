import { DragIndicator } from '@mui/icons-material';
import {
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
  InputLabel,
  MenuItem,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import Iframe from 'src/components/Iframe';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import * as Yup from 'yup';
import { screenLayoutToReferenceMap } from '../screens';

const Page = ({ screens, organizations, adAccounts, layouts }) => {
  const formik = useFormik({
    initialValues: {
      organizationId: '',
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
      selectedAdFiles: '',
    },
    validationSchema: Yup.object({
      organizationId: Yup.string().required('Organization is required'),
      name: Yup.string().max(255).required('Campaign name is required'),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      accountId: Yup.string().max(255).required('Ad Account name is required'),
      startAt: Yup.string().max(255).required('Start Date is required'),
      endAt: Yup.string().max(255).required('End Date name is required'),
      playTimeAt: Yup.string().max(255).required('Start time name is required'),
      endTimeAt: Yup.string().max(255).required('End Time name is required'),
      selectedAdFiles: Yup.string().max(255).required('Select at Least one Ad File'),
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

  return (
    <>
      <Head>
        <title>Create Campaign | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
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
                  <FormControl fullWidth>
                    <InputLabel id="ad-account">Select Ad Account</InputLabel>
                    <Select
                      error={!!(formik.touched.accountId && formik.errors.accountId)}
                      labelId="ad-account"
                      id="screen-select"
                      name="accountId"
                      value={formik.values.accountId}
                      label="Select Ad Account"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    >
                      {adAccounts.list.map((adAccount) => (
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
                          value={formik.values.endTimeAt}
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
                    <FormGroup>
                      <DayCheck label="Sunday" formik={formik} value="sunday" />
                      <DayCheck label="Monday" formik={formik} value="monday" />
                      <DayCheck label="Teusday" formik={formik} value="teusday" />
                      <DayCheck label="Wednesday" formik={formik} value="wednesday" />
                      <DayCheck label="Thursday" formik={formik} value="thursday" />
                      <DayCheck label="Friday" formik={formik} value="friday" />
                      <DayCheck label="Saturday" formik={formik} value="saturday" />
                    </FormGroup>
                  </Stack>
                  <Stack spacing={1}>
                    <FormHelperText>
                      Video and Image duration (59secs) - Media such as video uses the default video
                      duration
                    </FormHelperText>
                    <Slider
                      name="playDuration"
                      valueLabelDisplay="auto"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
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
                    Create Campaing
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
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
    const [screens, organizations, adAccounts, layouts] = await Promise.all([
      getResourse(ctx.req, '/screen'),
      getResourse(ctx.req, '/organization'),
      getResourse(ctx.req, '/ads-account'),
      getResourse(ctx.req, 'screen/layout/all'),
    ]);
    return {
      props: { screens, organizations, adAccounts, layouts },
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
    <Stack spacing={2}>
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
      {formik.values.selectedAdFiles && (
        <Stack spacing={2}>
          <Typography variant="subtitle1">Reorder Selected ad</Typography>
          <ReorderSelectedAdFiles formik={formik} adFiles={adFiles} />
        </Stack>
      )}
    </Stack>
  );
}

function AdFile({ name, url, reference, type, formik }) {
  const handleChange = (e) => {
    const { checked } = e.target;
    let selected_ads = formik.values.selectedAdFiles;

    if (checked) {
      selected_ads = [...selected_ads.split(',').filter(Boolean), reference].join(',');
    } else {
      selected_ads = selected_ads
        .split(',')
        .filter((day) => day !== reference)
        .filter(Boolean)
        .join(',');
    }
    formik.setFieldValue('selectedAdFiles', selected_ads);
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
            checked={formik.values.selectedAdFiles.includes(reference)}
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
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function ReorderSelectedAdFiles({ formik, adFiles }) {
  const selectedAdFiles = useMemo(
    () => adFiles.filter((adFile) => formik.values.selectedAdFiles.includes(adFile.reference)),
    [formik.values.selectedAdFiles]
  );

  const sortedSelectedAdFiles = useMemo(
    () =>
      selectedAdFiles.sort(
        (a, b) =>
          formik.values.selectedAdFiles.indexOf(a.reference) -
          formik.values.selectedAdFiles.indexOf(b.reference)
      ),
    [formik.values.selectedAdFiles]
  );

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      formik.values.selectedAdFiles.split(','),
      result.source.index,
      result.destination.index
    );

    formik.setFieldValue('selectedAdFiles', items.join(','));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="campaigns">
        {(provided, snapshot) => (
          <Stack {...provided.droppableProps} ref={provided.innerRef}>
            {sortedSelectedAdFiles.map((adFile, index) => (
              <Draggable draggableId={adFile.reference} index={index} key={adFile.reference}>
                {(_provided) => (
                  <Card
                    key={adFile.reference}
                    ref={_provided.innerRef}
                    {..._provided.draggableProps}
                    {..._provided.dragHandleProps}
                    sx={{
                      py: 1,
                      userSelect: 'none',
                      ..._provided.draggableProps.style,
                    }}
                  >
                    <CardHeader
                      title={adFile.name}
                      subheader={adFile.type}
                      action={<DragIndicator />}
                    />
                    <CardMedia component="img" height="200" image={adFile.url} title={name} />
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}
