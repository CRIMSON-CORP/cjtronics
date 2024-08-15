import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      organization: '',
      screen_id: '',
      ad_account: '',
      submit: null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      screen_id: Yup.string().max(255).required('Screen ID is required'),
      company: Yup.string().max(255).required('Company is required'),
      ad_account: Yup.string().max(255).required('Ad Account name is required'),
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
        <title>Create Ad | Dalukwa Admin</title>
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
            <CardHeader title="Create Ad" />
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
