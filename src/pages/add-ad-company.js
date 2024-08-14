import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      company_name: '',
      company_code: '',
      ad_account_manager_name: '',
      ad_account_manager_email: '',
      ad_account_manager_phone_number: '',
      account_officer: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      company_name: Yup.string().max(255).required('Company Name is required'),
      company_code: Yup.string().max(255).required('Company Code is required'),
      ad_account_manager_name: Yup.string()
        .max(255)
        .required('Ad account manager name is required'),
      ad_account_manager_email: Yup.string()
        .email('Must be a valid email!')
        .max(255)
        .required('Ad account manager name is required'),
      ad_account_manager_phone_number: Yup.string()
        .max(255)
        .required('Ad account manager phone number is required'),
      account_officer: Yup.string().max(255).required('Ad account officer is required'),
      password: Yup.string().max(255).required('Password is required'),
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
        <title>Add Ad Company | Dalukwa Admin</title>
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
            <CardHeader title="Add Ad Company" />
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.company_name && formik.errors.company_name)}
                      fullWidth
                      helperText={formik.touched.company_name && formik.errors.company_name}
                      label="Company Name"
                      name="company_name"
                      id="company_name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.company_name}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.company_code && formik.errors.company_code)}
                      fullWidth
                      helperText={formik.touched.company_code && formik.errors.company_code}
                      label="Company Code"
                      name="company_code"
                      id="company_code"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.company_code}
                    />
                    <FormHelperText>This can be the company's abbreviation e.g ABBV</FormHelperText>
                  </FormControl>
                  <Divider />
                  <Typography variant="subtitle1">Company Ad Account Manager</Typography>
                  <FormControl variant="outlined">
                    <TextField
                      error={
                        !!(
                          formik.touched.ad_account_manager_name &&
                          formik.errors.ad_account_manager_name
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.ad_account_manager_name &&
                        formik.errors.ad_account_manager_name
                      }
                      label="Ad Account Manager Name"
                      name="ad_account_manager_name"
                      id="ad_account_manager_name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.ad_account_manager_name}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={
                        !!(
                          formik.touched.ad_account_manager_email &&
                          formik.errors.ad_account_manager_email
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.ad_account_manager_email &&
                        formik.errors.ad_account_manager_email
                      }
                      label="Ad Account Manager Email"
                      name="ad_account_manager_email"
                      id="ad_account_manager_email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.ad_account_manager_email}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={
                        !!(
                          formik.touched.ad_account_manager_phone_number &&
                          formik.errors.ad_account_manager_phone_number
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.ad_account_manager_phone_number &&
                        formik.errors.ad_account_manager_phone_number
                      }
                      label="Ad Account Manager Phone number"
                      name="ad_account_manager_phone_number"
                      id="ad_account_manager_phone_number"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.ad_account_manager_phone_number}
                    />
                  </FormControl>
                  <Divider />
                  <Typography variant="subtitle1">Account Officer</Typography>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="account_officer">Account Officer</InputLabel>
                    <Select
                      error={!!(formik.touched.account_officer && formik.errors.account_officer)}
                      fullWidth
                      helperText={formik.touched.account_officer && formik.errors.account_officer}
                      label="Account Officer"
                      name="account_officer"
                      id="account_officer"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.account_officer}
                    >
                      <MenuItem value="Ajayi">Ajayi</MenuItem>
                    </Select>
                    {!!(formik.touched.account_officer && formik.errors.account_officer) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.account_officer}
                      </FormHelperText>
                    )}
                  </FormControl>
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
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function Setting({
  settingKey,
  value,
  onSettingChange,
  onPrivateChange,
  private_mode,
  onRadioChange,
}) {
  return (
    <Card p={3} sx={{ width: 'fit-content' }}>
      <CardHeader sx={{ textTransform: 'capitalize' }} title={settingKey.replaceAll('_', ' ')} />
      <Divider />
      <CardContent>
        <SettingForm
          settingKey={settingKey}
          value={value}
          private_mode={private_mode}
          onSettingChange={onSettingChange}
          onPrivateChange={onPrivateChange}
          onRadioChange={onRadioChange}
        />
      </CardContent>
    </Card>
  );
}
