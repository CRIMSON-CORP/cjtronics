import { ChevronRight, Monitor, Refresh } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Autocomplete,
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
  FormControl,
  FormHelperText,
  Unstable_Grid2 as Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import Layout from 'src/components/ScreenLayout';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import {
  getAllOrganizations,
  getAllScreens,
  getScreenCities,
  getScreenLayouts,
} from 'src/lib/actions';
import * as Yup from 'yup';

const Page = ({ screens, organizations, cities, screen_layouts }) => {
  return (
    <>
      <Head>
        <title>Screens | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Form organizations={organizations} cities={cities} screenLayouts={screen_layouts} />
            </Grid>
            <Grid xs={12} md={6}>
              <Screens screens={screens} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function ToolTipContent() {
  return (
    <div>
      <h3>How to link the mobile application to screen</h3>
      <ol>
        <li>Download the apk</li>
        <li>Install the apk on the device</li>
        <li>Copy device Id generated on the device</li>
        <li>
          Use device Id generated to create new screen details on cj tronics by folham's application
        </li>
        <li>Proceed to create campaign with the newly created screen details</li>
        <li>Start up the device and begin to view your adverts</li>
      </ol>
    </div>
  );
}

function Form({ organizations, cities, screenLayouts }) {
  const { replace, asPath } = useRouter();
  const { user } = useAuth();
  const defaultOrganizationReference = user?.organizationReference || '';
  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      screenName: '',
      screenId: '',
      screenHeight: '',
      screenWidth: '',
      screenCity: '',
      screenUniqueId: '',
      screenLayout: '',
      submit: null,
    },
    validationSchema: Yup.object({
      organizationId: Yup.string().required('Organization is required'),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      screenName: Yup.string().max(255).required('Screen Name is required'),
      screenHeight: Yup.string().max(255).required('Screen Height is required'),
      screenWidth: Yup.string().max(255).required('Screen Width is required'),
      screenCity: Yup.string().max(255).required('Screen Location is required'),
      screenLayout: Yup.string().max(255).required('Screen Layout is required'),
      screenUniqueId: Yup.string().max(255).required('Device ID is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      await toast.promise(axios.post('/api/admin/screens/create', values), {
        loading: 'Creating Screen, Hang on...',
        error: (err) => {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
          return err.response?.data?.message || err.message;
        },
        success: () => {
          helpers.setStatus({ success: true });
          helpers.setSubmitting(false);
          replace(asPath);
          return 'Screen Created';
        },
      });
    },
  });

  const citiesOptions = useMemo(() => cities.map((city) => city.city), [cities]);

  const handleCityChange = useCallback((_event, value) => {
    formik.setFieldValue('screenCity', value);
  }, []);

  const selectedScreenCoordinates = useMemo(() => {
    const city = cities.find((city) => city.city === formik.values.screenCity);
    if (city) {
      return {
        longitude: city.lng,
        latitude: city.lat,
      };
    }
  }, [formik.values.screenCity]);

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5">Create Screen</Typography>
            <Tooltip title={<ToolTipContent />}>
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl variant="outlined">
              <InputLabel htmlFor="organizationId">Select Organization</InputLabel>
              <Select
                error={!!(formik.touched.organizationId && formik.errors.organizationId)}
                fullWidth
                label="Account Officer"
                name="organizationId"
                id="organizationId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.organizationId}
                disabled={!!defaultOrganizationReference}
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
                error={!!(formik.touched.screenId && formik.errors.screenId)}
                fullWidth
                helperText={formik.touched.screenId && formik.errors.screenId}
                label="Screen ID"
                name="screenId"
                id="screenId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.screenId}
              />
              <FormHelperText>e.g FLH2</FormHelperText>
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screenName && formik.errors.screenName)}
                fullWidth
                helperText={formik.touched.screenName && formik.errors.screenName}
                label="Screen Name"
                name="screenName"
                id="screenName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.screenName}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screenHeight && formik.errors.screenHeight)}
                fullWidth
                helperText={formik.touched.screenHeight && formik.errors.screenHeight}
                label="Screen Height"
                name="screenHeight"
                id="screenHeight"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.screenHeight}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screenWidth && formik.errors.screenWidth)}
                fullWidth
                helperText={formik.touched.screenWidth && formik.errors.screenWidth}
                label="Screen Width"
                name="screenWidth"
                id="screenWidth"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.screenWidth}
              />
            </FormControl>
            <Divider />
            <FormControl variant="outlined">
              <Autocomplete
                error={formik.touched.screenCity && formik.errors.screenCity}
                fullWidth
                options={citiesOptions}
                label="Screen Location"
                name="screenCity"
                id="screenCity"
                onBlur={formik.handleBlur}
                onChange={handleCityChange}
                value={formik.values.screenCity || null}
                renderInput={(params) => <TextField {...params} label="Select Screen Location" />}
              />
              {!!(formik.touched.screenCity && formik.errors.screenCity) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.screenCity}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                fullWidth
                disabled
                label="Screen longitude"
                name="screen_longitude"
                id="screen_longitude"
                type="text"
                value={selectedScreenCoordinates?.longitude || ''}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                fullWidth
                disabled
                label="Screen latitude"
                name="screen_latitude"
                id="screen_latitude"
                type="text"
                value={selectedScreenCoordinates?.latitude || ''}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screenUniqueId && formik.errors.screenUniqueId)}
                fullWidth
                helperText={formik.touched.screenUniqueId && formik.errors.screenUniqueId}
                label="Unique Device ID"
                name="screenUniqueId"
                id="screenUniqueId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.screenUniqueId}
              />
            </FormControl>
            <Divider />
            <Typography variant="subtitle1">Select Screen Layout</Typography>
            <Stack>
              <Grid container spacing={{ xs: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {screenLayouts.map((screenLayout) => (
                  <Grid xs={2} sm={4} md={4} key={screenLayout.id}>
                    {screenLayoutToReferenceMap[screenLayout.reference]?.(formik, screenLayout)}
                  </Grid>
                ))}
              </Grid>
              {!!(formik.touched.screenLayout && formik.errors.screenLayout) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.screenLayout}
                </FormHelperText>
              )}
            </Stack>
            {formik.errors.submit && (
              <Typography color="error" sx={{ mt: 3 }} variant="body2">
                {formik.errors.submit}
              </Typography>
            )}
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
              Add Screen
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

function Screens({ screens }) {
  const { replace, asPath } = useRouter();
  const refreshPageForScreens = () => replace(asPath);

  const hanldePageChange = (_event, value) => {
    replace(`/screens?page=${value}`);
  };
  return (
    <Card>
      <CardHeader
        title={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Typography variant="h5">
              Screens <Chip label={screens.totalRows} />
            </Typography>
            <Button startIcon={<Refresh />} onClick={refreshPageForScreens}>
              Refresh Screens
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Stack>
          <FormHelperText>
            NOTE: Resolution is width x height and its unit is pixel (px). This is gotten directly
            from the device.
          </FormHelperText>
          <List>
            {screens.screen.map((screen) => (
              <ListItem
                key={screen.id}
                secondaryAction={
                  <Link href={`/screens/${screen.reference}`}>
                    <IconButton>
                      <ChevronRight />
                    </IconButton>
                  </Link>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <Monitor />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${screen.screenId} - ${screen.screenName}`}
                  secondary={`${screen.screenWidth} x ${screen.screenHeight}`}
                />
              </ListItem>
            ))}
          </List>
          <Pagination
            sx={{ ul: { justifyContent: 'space-between' } }}
            count={Math.ceil(screens.totalRows / +screens.rowsPerPage)}
            siblingCount={4}
            page={parseInt(screens.currentPage)}
            onChange={hanldePageChange}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export const screenLayoutToReferenceMap = {
  VBSGTREW43: (formik, screenLayout, params) => (
    <Layout
      full
      landscape
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
  JHSFER2763: (formik, screenLayout, params) => (
    <Layout
      landscape
      horizontal
      split="80%,20%"
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
  HDGTW5763: (formik, screenLayout, params) => (
    <Layout
      full
      landscape={false}
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
  SGDRWT5247: (formik, screenLayout, params) => (
    <Layout
      landscape
      horizontal
      split="50%,50%"
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
  KJUYTE4352: (formik, screenLayout, params) => (
    <Layout
      landscape={false}
      split="80%,20%"
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
  SGHY5438JH: (formik, screenLayout, params) => (
    <Layout
      landscape={false}
      split="50%,50%"
      formik={formik}
      name="screenLayout"
      title={screenLayout.layout}
      value={screenLayout.reference}
      {...params}
    />
  ),
};

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  try {
    const [screens, organizations, cities, screen_layouts] = await Promise.all([
      getAllScreens(ctx.req, params),
      getAllOrganizations(ctx.req),
      getScreenCities(ctx.req),
      getScreenLayouts(ctx.req),
    ]);
    return {
      props: { screens, organizations, cities, screen_layouts },
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

  // return {
  //   props: {
  //     users: [
  //       {
  //         createdAt: '2024-08-07T23:10:31.980Z',
  //         email: 'aa@aa.com',
  //         firstName: 'aa',
  //         lastName: 'aa',
  //         organizationId: '64ae8231564cd6a76b7b2a42',
  //         privilege: 'user',
  //         type: 'individual',
  //         updatedAt: '2024-08-07T23:10:31.980Z',
  //         userActiveStatus: 1,
  //         username: 'aa.aa',
  //       },
  //     ],
  //     total_results: 1,
  //     pager_current_page: 1,
  //   },
  // };
});
