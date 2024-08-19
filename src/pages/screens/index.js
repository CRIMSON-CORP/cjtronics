import { ChevronRight, Monitor, Refresh } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import Layout from 'src/components/ScreenLayout';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      organization: '',
      screen_id: '',
      screen_name: '',
      screen_height: '',
      screen_width: '',
      screen_location: '',
      screen_longitude: '',
      screen_latitude: '',
      screen_layout: '',
      unique_device_id: '',
      ad_account_manager_name: '',
      ad_account_manager_email: '',
      ad_account_manager_phone_number: '',
      account_officer: '',

      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      screen_id: Yup.string().max(255).required('Screen ID is required'),
      screen_name: Yup.string().max(255).required('Screen Name is required'),
      screen_height: Yup.string().max(255).required('Screen Height is required'),
      screen_width: Yup.string().max(255).required('Screen Width is required'),
      screen_location: Yup.string().max(255).required('Screen Location is required'),
      screen_layout: Yup.string().max(255).required('Screen Layout is required'),
      unique_device_id: Yup.string().max(255).required('Device ID is required'),
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
                        <InputLabel htmlFor="organization">Select Organization</InputLabel>
                        <Select
                          error={!!(formik.touched.organization && formik.errors.organization)}
                          fullWidth
                          label="Account Officer"
                          name="organization"
                          id="organization"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.organization}
                        >
                          <MenuItem value="Ajayi">Ajayi</MenuItem>
                        </Select>
                        {!!(formik.touched.organization && formik.errors.organization) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.organization}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={!!(formik.touched.screen_id && formik.errors.screen_id)}
                          fullWidth
                          helperText={formik.touched.screen_id && formik.errors.screen_id}
                          label="Screen ID"
                          name="screen_id"
                          id="screen_id"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="email"
                          value={formik.values.screen_id}
                        />
                        <FormHelperText>e.g FLH2</FormHelperText>
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={!!(formik.touched.screen_name && formik.errors.screen_name)}
                          fullWidth
                          helperText={formik.touched.screen_name && formik.errors.screen_name}
                          label="Screen Name"
                          name="screen_name"
                          id="screen_name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="email"
                          value={formik.values.screen_name}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={!!(formik.touched.screen_height && formik.errors.screen_height)}
                          fullWidth
                          helperText={formik.touched.screen_height && formik.errors.screen_height}
                          label="Screen Height"
                          name="screen_height"
                          id="screen_height"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="number"
                          value={formik.values.screen_height}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={!!(formik.touched.screen_width && formik.errors.screen_width)}
                          fullWidth
                          helperText={formik.touched.screen_width && formik.errors.screen_width}
                          label="Screen Width"
                          name="screen_width"
                          id="screen_width"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="number"
                          value={formik.values.screen_width}
                        />
                      </FormControl>
                      <Divider />
                      <FormControl variant="outlined">
                        <InputLabel htmlFor="organization">Select Screen Location</InputLabel>
                        <Select
                          error={
                            !!(formik.touched.screen_location && formik.errors.screen_location)
                          }
                          fullWidth
                          label="Screen Location"
                          name="screen_location"
                          id="screen_location"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.screen_location}
                        >
                          <MenuItem value="Ajayi">Ajayi</MenuItem>
                        </Select>
                        {!!(formik.touched.screen_location && formik.errors.screen_location) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.screen_location}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={
                            !!(formik.touched.screen_longitude && formik.errors.screen_longitude)
                          }
                          fullWidth
                          helperText={
                            formik.touched.screen_longitude && formik.errors.screen_longitude
                          }
                          disabled={!formik.values.screen_longitude}
                          label="Screen longitude"
                          name="screen_longitude"
                          id="screen_longitude"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="text"
                          value={formik.values.screen_longitude}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={
                            !!(formik.touched.screen_latitude && formik.errors.screen_latitude)
                          }
                          fullWidth
                          helperText={
                            formik.touched.screen_latitude && formik.errors.screen_latitude
                          }
                          disabled={!formik.values.screen_latitude}
                          label="Screen latitude"
                          name="screen_latitude"
                          id="screen_latitude"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="text"
                          value={formik.values.screen_latitude}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={
                            !!(formik.touched.unique_device_id && formik.errors.unique_device_id)
                          }
                          fullWidth
                          helperText={
                            formik.touched.unique_device_id && formik.errors.unique_device_id
                          }
                          label="Unique Device ID"
                          name="unique_device_id"
                          id="unique_device_id"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="email"
                          value={formik.values.ad_account_manager_email}
                        />
                      </FormControl>
                      <Divider />
                      <Typography variant="subtitle1">Select Screen Layout</Typography>
                      <Stack>
                        <Grid container spacing={{ xs: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              full
                              landscape
                              formik={formik}
                              name="screen_layout"
                              value="landspace-full"
                              title="Landscape Full"
                            />
                          </Grid>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              landscape
                              split="80%,20%"
                              formik={formik}
                              name="screen_layout"
                              value="landspace-80-20"
                              title="Landscape 80/20"
                            />
                          </Grid>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              landscape
                              split="50%,50%"
                              horizontal
                              formik={formik}
                              name="screen_layout"
                              value="landspace-50-50"
                              title="Landscape Split"
                            />
                          </Grid>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              landscape={false}
                              full
                              formik={formik}
                              name="screen_layout"
                              value="portrait-full"
                              title="Portrait"
                            />
                          </Grid>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              landscape={false}
                              split="80%,20%"
                              formik={formik}
                              name="screen_layout"
                              value="portrait-80-20"
                              title="Portrait 80/20"
                            />
                          </Grid>
                          <Grid xs={2} sm={4} md={4}>
                            <Layout
                              landscape={false}
                              split="50%,50%"
                              horizontal={false}
                              formik={formik}
                              name="screen_layout"
                              value="portrait-split"
                              title="Portrait Split"
                            />
                          </Grid>
                        </Grid>
                        {!!(formik.touched.screen_layout && formik.errors.screen_layout) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.screen_layout}
                          </FormHelperText>
                        )}
                      </Stack>
                      <Button
                        variant="contained"
                        size="large"
                        disabled={!(formik.isValid && formik.dirty)}
                      >
                        Add Company
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
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
                        Screens <Chip label="6" />
                      </Typography>
                      <Button startIcon={<Refresh />}>Refresh Screens</Button>
                    </Stack>
                  }
                />
                <CardContent>
                  <Stack>
                    <FormHelperText>
                      NOTE: Resolution is width x height and its unit is pixel (px). This is gotten
                      directly from the device.
                    </FormHelperText>
                    <List>
                      <ListItem
                        secondaryAction={
                          <IconButton>
                            <ChevronRight />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Monitor />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="EKNT-LEKKI ADMIRALTY" secondary="1280 x 720" />
                      </ListItem>
                      <ListItem
                        secondaryAction={
                          <IconButton>
                            <ChevronRight />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Monitor />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="EKNT-LEKKI ADMIRALTY" secondary="1280 x 720" />
                      </ListItem>
                    </List>
                  </Stack>
                </CardContent>
              </Card>
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
