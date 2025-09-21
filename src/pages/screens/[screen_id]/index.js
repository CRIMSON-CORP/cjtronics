import { Close, Delete, Edit, HelpOutline } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Unstable_Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import {
  getAllOrganizations,
  getAllScreens,
  getResourse,
  getScreen,
  getScreenCities,
  getScreenLayouts,
} from 'src/lib/actions';
import * as Yup from 'yup';
import { screenLayoutToReferenceMap } from '..';

const Page = ({ screens, screen, organizations, cities, screen_layouts, screen_campaigns }) => {
  const { query, replace } = useRouter();
  console.log(screen_campaigns);

  const handleScreenSelect = (event) => {
    replace(`/screens/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Screen campaign | Devias Kit</title>
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
            <Typography variant="h4">Screen campaign</Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                  <Select
                    labelId="scrren-select-label"
                    id="screen-select"
                    value={query.screen_id}
                    label="Select Screen"
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
            <ScreenCampaigns campaigns={screen_campaigns} />
            <ScreenDetails
              cities={cities}
              screen={screen}
              organizations={organizations}
              screenLayouts={screen_layouts}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const columns = [
  { id: 'campaigns', label: 'Campaigns', minWidth: 170 },
  { id: 'ad_accounts', label: 'Ad Accounts', minWidth: 100 },
];

function ScreenCampaigns({ campaigns }) {
  const { query, replace } = useRouter();
  const handleRowsPerPageChange = useCallback(
    (event) => {
      const queryParams = new URLSearchParams(query);
      queryParams.set('size', event.target.value);
      queryParams.delete('screen_id');
      replace(`/screens/${query.screen_id}?${queryParams.toString()}`);
    },
    [query, replace]
  );

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    queryParams.delete('screen_id');
    replace(`/screens/${query.screen_id}?${queryParams.toString()}`);
  };

  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.list.map((campaign) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={campaign.reference}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.adsAccountName}</TableCell>
                </TableRow>
              );
            })}
            {campaigns.list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="h6" py={3}>
                    No campaigns found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={+campaigns.totalRows}
        rowsPerPage={+campaigns.rowsPerPage}
        page={+campaigns.currentPage - 1}
        onPageChange={onPageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}

function ScreenDetails({ screen, organizations, cities, screenLayouts }) {
  const { replace, asPath } = useRouter();
  const onNotifyChange = (event) => {
    const { checked } = event.target;
    toast.promise(
      axios.post('/api/admin/screens/toggle-notify', {
        reference: screen.reference,
        notify: checked,
      }),
      {
        loading: `Turning ${checked ? 'on' : 'off'} Notifications...`,
        success: () => {
          replace(asPath);
          return `Notifications turned ${checked ? 'on' : 'off'}!`;
        },
        error: `Error turning ${checked ? 'on' : 'off'} Notifications!, Please try again`,
      }
    );
  };
  const onScrollChange = (event) => {
    const { checked } = event.target;
    toast.promise(
      axios.post('/api/admin/screens/toggle-scroll', {
        reference: screen.reference,
        scroll: checked,
      }),
      {
        loading: `Turning ${checked ? 'on' : 'off'} Scrolling Banner...`,
        success: () => {
          replace(asPath);
          return `Scrolling Banner turned ${checked ? 'on' : 'off'}!`;
        },
        error: `Error turning ${checked ? 'on' : 'off'} Scrolling Banner!, Please try again`,
      }
    );
  };

  const deleteScreen = () => {
    toast.promise(
      axios.post('/api/admin/screens/delete', {
        reference: screen.reference,
      }),
      {
        loading: 'Deleting Screen, Hold on...',
        success: () => {
          replace('/screens');
          return 'Screen Deleted!';
        },
        error: 'Failed to delete this screen, Please try again',
      }
    );
  };

  return (
    <Card>
      <CardHeader
        title={
          <Stack justifyContent="space-between" direction="row" flexWrap="wrap" gap={2}>
            <Typography variant="h5">Screen Details</Typography>
            <Stack direction="row" spacing={1}>
              <EditScreen
                screen={screen}
                cities={cities}
                organizations={organizations}
                screenLayouts={screenLayouts}
              />
              <ConfirmAction
                color="error"
                action={deleteScreen}
                title="Delete Screen?"
                proceedText="Delete Screen"
                buttonProps={{ startIcon: <Delete /> }}
                content="Are you absolutely sure you want to delete this screen?"
              >
                Delete
              </ConfirmAction>
            </Stack>
          </Stack>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography>Screen Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{screen.screenName}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Layout</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{screen.layoutName}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Screen Output Size (W x H):</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {screen.screenWidth} x {screen.screenHeight}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Screen ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{screen.screenId}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Device ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{screen.deviceId}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Selected Layout</Typography>
                </TableCell>
                <TableCell>
                  <Box maxWidth={300}>
                    {screenLayoutToReferenceMap[screen.layoutReference](undefined, screen)}
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Notificatons</Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Switch checked={screen.isNotify} onChange={onNotifyChange} />}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Scrolling Banner</Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Switch checked={screen.isScroll} onChange={onScrollChange} />}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: 2,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

function EditScreen({ screen, organizations, cities, screenLayouts }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const openModal = () => {
    setEditModalOpen(true);
  };
  const closeModal = () => {
    setEditModalOpen(false);
  };
  return (
    <>
      <Button onClick={openModal} startIcon={<Edit />}>
        Edit
      </Button>
      <Modal open={editModalOpen} onClose={closeModal}>
        <Box sx={modalStyles}>
          <EditScreenForm
            screen={screen}
            cities={cities}
            closeModal={closeModal}
            organizations={organizations}
            screenLayouts={screenLayouts}
          />
        </Box>
      </Modal>
    </>
  );
}

const cardStyles = {
  width: '100%',
  maxWidth: 700,
  maxHeight: '85vh',
  overflowY: 'auto',
};

const EditScreenForm = ({ screen, organizations, cities, screenLayouts, closeModal }) => {
  const { replace, asPath } = useRouter();
  const formik = useFormik({
    initialValues: {
      organizationId: screen.organizationReference,
      screenName: screen.screenName,
      screenId: screen.screenId,
      screenHeight: screen.screenHeight,
      screenWidth: screen.screenWidth,
      screenCity: screen.screenCity,
      screenUniqueId: screen.deviceId,
      screenLayout: screen.layoutReference,
      submit: null,
    },
    validationSchema: Yup.object({
      organizationId: Yup.string().max(255).required('organization ID is required'),
      screenName: Yup.string().max(255).required('Screen Name is required'),
      screenId: Yup.string().max(255).required('Screen ID is required'),
      screenHeight: Yup.string().max(255).required('Screen Height is required'),
      screenWidth: Yup.string().max(255).required('Screen Width is required'),
      screenCity: Yup.string().max(255).required('Screen Layout is required'),
      screenUniqueId: Yup.string().max(255).required('Device ID is required'),
    }),
    onSubmit: async (values, helpers) => {
      values.reference = screen.reference;
      values.screenCity = 'Lagos';
      helpers.setSubmitting(true);
      await toast.promise(axios.post('/api/admin/screens/edit', values), {
        loading: 'Updating Screen, Hang on...',
        error: (err) => {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
          return err.response?.data?.message || err.message;
        },
        success: () => {
          helpers.setStatus({ success: true });
          helpers.setSubmitting(false);
          replace(asPath);
          closeModal();
          return 'Screen Updated';
        },
      });
    },
  });

  const citiesOptions = useMemo(() => cities.map((city) => city.city), [cities]);

  const handleCityChange = useCallback(
    (_event, value) => {
      formik.setFieldValue('screenCity', value);
    },
    [formik]
  );

  const selectedScreenCoordinates = useMemo(() => {
    const city = cities.find((city) => city.city === formik.values.screenCity);
    if (city) {
      return {
        longitude: city.lng,
        latitude: city.lat,
      };
    }
  }, [cities, formik.values.screenCity]);

  return (
    <Card sx={cardStyles}>
      <CardHeader
        title={
          <Stack direction="row" justifyContent="space-between" gap={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">Edit Screen</Typography>
              <Tooltip title={<ToolTipContent />}>
                <IconButton>
                  <HelpOutline />
                </IconButton>
              </Tooltip>
            </Stack>
            <IconButton onClick={closeModal}>
              <Close />
            </IconButton>
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
              {!!(formik.touched.screen_layout && formik.errors.screen_layout) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.screen_layout}
                </FormHelperText>
              )}
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
              Update Screen
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

function ToolTipContent() {
  return (
    <div>
      <h3>How to link the mobile application to screen</h3>
      <ol>
        <li>Download the apk</li>
        <li>Install the apk on the device</li>
        <li>Copy device Id generated on the device</li>
        <li>
          Use device Id generated to create new screen details on cj tronics by folham&apos;s
          application
        </li>
        <li>Proceed to create campaign with the newly created screen details</li>
        <li>Start up the device and begin to view your adverts</li>
      </ol>
    </div>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };
  try {
    const [screens, screen, organizations, cities, screen_layouts, screen_campaigns] =
      await Promise.all([
        getAllScreens(ctx.req),
        getScreen(ctx.req, ctx.query.screen_id),
        getAllOrganizations(ctx.req),
        getScreenCities(ctx.req),
        getScreenLayouts(ctx.req),
        getResourse(ctx.req, `/campaign/screen/${ctx.query.screen_id}`, params),
      ]);
    return {
      props: { screens, screen, organizations, cities, screen_layouts, screen_campaigns },
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
