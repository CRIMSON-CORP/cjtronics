import { Replay } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  Stack,
  TextField,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPasword: '',
      submit: null,
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().max(255).required('Old Password is required'),
      newPassword: Yup.string().max(255).required('New Password is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        await toast.promise(axios.post('/api/admin/auth/reset-password', values), {
          loading: 'Reseting Password...',
          success: (response) => {
            helpers.resetForm();
            return response.data.message;
          },
          error: (error) => {
            const err = error.response?.data?.message ?? error.message;
            helpers.setSubmitting(false);
            return err;
          },
        });
      } catch (error) {}
    },
  });

  return (
    <>
      <Head>
        <title>Reset Password | Cjtronics Admin</title>
      </Head>
      <Box component="main" flexGrow={1} py={3}>
        <Container maxWidth="xl">
          <Card>
            <CardHeader title="Reset Password" />
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.oldPassword && formik.errors.oldPassword)}
                      fullWidth
                      helperText={formik.touched.oldPassword && formik.errors.oldPassword}
                      label="Old Password"
                      name="oldPassword"
                      id="oldPassword"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="password"
                      value={formik.values.oldPassword}
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.newPassword && formik.errors.newPassword)}
                      fullWidth
                      helperText={formik.touched.newPassword && formik.errors.newPassword}
                      label="New Password"
                      name="newPassword"
                      id="newPassword"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="password"
                      value={formik.values.newPassword}
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    endIcon={
                      formik.isSubmitting ? (
                        <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                      ) : (
                        <Replay />
                      )
                    }
                    variant="contained"
                    size="large"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    Reset Password
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
