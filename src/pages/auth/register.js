import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Unstable_Grid2 as Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import axios from 'src/lib/axios';
import * as Yup from 'yup';

const Page = ({ organizations }) => {
  const router = useRouter();
  const auth = useAuth();
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      organizationRef: '',
      confirmPassword: '',
      submit: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().max(255).required('First name is required'),
      lastName: Yup.string().max(255).required('Last name is required'),
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
      phone: Yup.string().max(255).required('Phone number is required'),
      password: Yup.string().max(255).required('Password is required'),
      organizationRef: Yup.string().max(255).required('Organization is required'),
      confirmPassword: Yup.string()
        .max(255)
        .required('Confirm Password is required')
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        await toast.promise(auth.createAdvertizer(values), {
          loading: 'Registering you...',
          success: (message) => {
            router.push('/auth/login');
            return message;
          },
          error: (err) => {
            helpers.setStatus({ success: false });
            helpers.setErrors({ submit: err.message });
            helpers.setSubmitting(false);
            return err?.response?.data?.message || err.message;
          },
        });
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Register | Devias Kit</title>
      </Head>
      <Box
        sx={{
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%',
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Register</Typography>
              <Typography color="text.secondary" variant="body2">
                Already have an account? &nbsp;
                <Link component={NextLink} href="/auth/login" underline="hover" variant="subtitle2">
                  Log in
                </Link>
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      error={!!(formik.touched.firstName && formik.errors.firstName)}
                      fullWidth
                      helperText={formik.touched.firstName && formik.errors.firstName}
                      label="First Name"
                      name="firstName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      error={!!(formik.touched.lastName && formik.errors.lastName)}
                      fullWidth
                      helperText={formik.touched.lastName && formik.errors.lastName}
                      label="Last name"
                      name="lastName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.lastName}
                    />
                  </Grid>
                </Grid>
                <TextField
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label="Email Address"
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />
                <TextField
                  error={!!(formik.touched.phone && formik.errors.phone)}
                  fullWidth
                  helperText={formik.touched.phone && formik.errors.phone}
                  label="Phone number"
                  name="phone"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="tel"
                  value={formik.values.phone}
                />
                <FormControl variant="outlined">
                  <InputLabel htmlFor="organizationId">Select Organization</InputLabel>
                  <Select
                    error={!!(formik.touched.organizationRef && formik.errors.organizationRef)}
                    fullWidth
                    label="Select Organization"
                    name="organizationRef"
                    id="organizationRef"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.organizationRef}
                  >
                    {organizations.map((organization) => (
                      <MenuItem key={organization.reference} value={organization.reference}>
                        {organization.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!(formik.touched.organizationRef && formik.errors.organizationRef) && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      {formik.errors.organizationRef}
                    </FormHelperText>
                  )}
                </FormControl>
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
                <TextField
                  error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                  fullWidth
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  label="Confirm Password"
                  name="confirmPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.confirmPassword}
                />
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                startIcon={
                  formik.isSubmitting && (
                    <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                  )
                }
              >
                Continue
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;

export const getServerSideProps = async function () {
  try {
    const response = await axios.get('/auth/list/organization');

    if (response.data.status) {
      return {
        props: { organizations: response.data.data },
      };
    } else throw response;
  } catch (error) {
    console.log(error);
    if (error.response?.status === 401) {
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
};
