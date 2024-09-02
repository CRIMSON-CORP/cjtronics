import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Unstable_Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import Head from 'next/head';
import ScreenLayout from 'src/components/ScreenLayout';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      organization: '',
      campaign_name: '',
      screen_id: '',
      ad_account: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      screen_layout: '',
      selected_days: [],
      duration: 0,
      submit: null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      campaign_name: Yup.string().max(255).required('Campaign name is required'),
      screen_id: Yup.string().max(255).required('Screen ID is required'),
      company: Yup.string().max(255).required('Company is required'),
      ad_account: Yup.string().max(255).required('Ad Account name is required'),
      start_date: Yup.string().max(255).required('Start Date is required'),
      end_date: Yup.string().max(255).required('End Date name is required'),
      start_time: Yup.string().max(255).required('Start time name is required'),
      end_time: Yup.string().max(255).required('End Time name is required'),
      screen_layout: Yup.string().max(255).required('Screen layout name is required'),
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
                    <InputLabel htmlFor="organization">Select Organization</InputLabel>
                    <Select
                      error={!!(formik.touched.organization && formik.errors.organization)}
                      fullWidth
                      label="Organization"
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
                      error={!!(formik.touched.campaign_name && formik.errors.campaign_name)}
                      fullWidth
                      helperText={formik.touched.campaign_name && formik.errors.campaign_name}
                      label="Campaign Name"
                      name="campaign_name"
                      id="campaign_name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.campaign_name}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="screen_id">Select Screen</InputLabel>
                    <Select
                      error={!!(formik.touched.screen_id && formik.errors.screen_id)}
                      fullWidth
                      label="Select Screen"
                      name="screen_id"
                      id="screen_id"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.screen_id}
                    >
                      <MenuItem value="Ajayi">Ajayi</MenuItem>
                    </Select>
                    {!!(formik.touched.screen_id && formik.errors.screen_id) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.screen_id}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="company">Select Ad Account</InputLabel>
                    <Select
                      error={!!(formik.touched.ad_account && formik.errors.ad_account)}
                      fullWidth
                      label="Account Officer"
                      name="ad_account"
                      id="ad_account"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.ad_account}
                    >
                      <MenuItem value="Ajayi">Ajayi</MenuItem>
                    </Select>
                    {!!(formik.touched.ad_account && formik.errors.ad_account) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.ad_account}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <DatePicker
                          onChange={(date) => {
                            formik.setFieldValue('start_date', date);
                          }}
                          name="start_date"
                          label="Select Start date"
                          fullWidth
                        />
                        {!!(formik.touched.start_date && formik.errors.start_date) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.start_date}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <DatePicker
                          onChange={(date) => {
                            formik.setFieldValue('end_date', date);
                          }}
                          name="end_date"
                          label="Select End Date"
                          fullWidth
                        />
                        {!!(formik.touched.end_date && formik.errors.end_date) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.end_date}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <TimePicker
                          onChange={(date) => {
                            formik.setFieldValue('start_time', date);
                          }}
                          name="start_time"
                          label="Select Start Time"
                          fullWidth
                        />
                        {!!(formik.touched.start_time && formik.errors.start_time) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.start_time}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl variant="outlined" fullWidth>
                        <TimePicker
                          onChange={(date) => {
                            formik.setFieldValue('end_time', date);
                          }}
                          name="end_time"
                          label="Select End Time"
                          fullWidth
                        />
                        {!!(formik.touched.end_time && formik.errors.end_time) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.end_time}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">Layout Type</Typography>
                    <Box maxWidth={300}>
                      <ScreenLayout
                        formik={formik}
                        full
                        landscape
                        name="screen_layout"
                        title="Full"
                        value="full"
                      />
                    </Box>
                  </Stack>
                  <Stack spacing={1}>
                    <FormHelperText>
                      Play Campaign (Sunday - Saturday) choose to show campaign everyday or select
                      specific days.
                    </FormHelperText>
                    <FormGroup>
                      <DayCheck label="Sunday" formik={formik} value="sunday" />
                      <DayCheck label="Monday" formik={formik} value="moday" />
                      <DayCheck label="Teuday" formik={formik} value="teusday" />
                      <DayCheck label="Wednesday" formik={formik} value="wednesday" />
                      <DayCheck label="Thursday" formik={formik} value="thurday" />
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
                      name="duration"
                      valueLabelDisplay="auto"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      min={0}
                      max={60}
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!(formik.isValid && formik.dirty)}
                  >
                    Create Ad Account
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
    let selected_days = [...formik.values.selected_days];

    if (checked) {
      selected_days.push(value);
    } else {
      selected_days = selected_days.filter((day) => day !== value);
    }
    formik.setFieldValue('selected_days', selected_days);
  };

  return (
    <FormControlLabel
      onChange={handleChange}
      value={value}
      name
      control={<Checkbox />}
      label={label}
      checked={formik.values.selected_days.includes(value)}
    />
  );
}
