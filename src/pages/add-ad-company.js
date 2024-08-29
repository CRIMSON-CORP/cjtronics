import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
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
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getUsers } from 'src/lib/actions';
import * as Yup from 'yup';

const Page = ({ users }) => {
  const { push } = useRouter();
  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      accountOfficer: '',
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required('Company Name is required'),
      code: Yup.string().max(255).required('Company Code is required'),
      managerName: Yup.string().max(255).required('Ad account manager name is required'),
      managerPhone: Yup.string().max(255).required('Ad account manager phone number is required'),
      managerEmail: Yup.string()
        .email('Must be a valid email!')
        .max(255)
        .required('Ad account manager name is required'),
      accountOfficer: Yup.string().max(255).required('Ad account officer is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        await toast.promise(axios.post('/api/admin/companies/create', values), {
          loading: 'Creating Ad Company, hang on a sec...',
          success: (response) => {
            push('/users/companies');
            return response.data.message;
          },
          error: (error) => {
            return error.response?.data?.message || error.message;
          },
        });
      } catch (error) {
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const filteredUser = useMemo(() => users.filter((user) => user.isActive), [users]);

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
                      error={!!(formik.touched.name && formik.errors.name)}
                      fullWidth
                      helperText={formik.touched.name && formik.errors.name}
                      label="Company Name"
                      name="name"
                      id="name"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.name}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.code && formik.errors.code)}
                      fullWidth
                      helperText={formik.touched.code && formik.errors.code}
                      label="Company Code"
                      name="code"
                      id="code"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.code}
                    />
                    <FormHelperText>This can be the company's abbreviation e.g ABBV</FormHelperText>
                  </FormControl>
                  <Divider />
                  <Typography variant="subtitle1">Company Ad Account Manager</Typography>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.managerName && formik.errors.managerName)}
                      fullWidth
                      helperText={formik.touched.managerName && formik.errors.managerName}
                      label="Ad Account Manager Name"
                      name="managerName"
                      id="managerName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.managerName}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.managerEmail && formik.errors.managerEmail)}
                      fullWidth
                      helperText={formik.touched.managerEmail && formik.errors.managerEmail}
                      label="Ad Account Manager Email"
                      name="managerEmail"
                      id="managerEmail"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.managerEmail}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.managerPhone && formik.errors.managerPhone)}
                      fullWidth
                      helperText={formik.touched.managerPhone && formik.errors.managerPhone}
                      label="Ad Account Manager Phone number"
                      name="managerPhone"
                      id="managerPhone"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="tel"
                      value={formik.values.managerPhone}
                    />
                  </FormControl>
                  <Divider />
                  <Typography variant="subtitle1">Account Officer</Typography>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="account_officer">Account Officer</InputLabel>
                    <Select
                      error={!!(formik.touched.accountOfficer && formik.errors.accountOfficer)}
                      fullWidth
                      label="Account Officer"
                      name="accountOfficer"
                      id="accountOfficer"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.accountOfficer}
                    >
                      {filteredUser.map((user) => (
                        <MenuItem key={user.id} value={user.reference}>
                          {user.firstName} {user.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!(formik.touched.accountOfficer && formik.errors.accountOfficer) && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {formik.errors.accountOfficer}
                      </FormHelperText>
                    )}
                  </FormControl>
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

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  try {
    const { users } = await getUsers(ctx.req);
    return {
      props: {
        users,
      },
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
