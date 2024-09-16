import { Box, Button, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import * as Yup from 'yup';

const Page = () => {
  const router = useRouter();
  const { forgotPassword, signOut } = useAuth();
  const theme = useTheme();
  const emailPrams = router.query.email;

  const formik = useFormik({
    initialValues: {
      email: emailPrams || '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    }),
    onSubmit: async ({ email }, helpers) => {
      console.log('submit');

      helpers.setSubmitting(true);
      await toast.promise(forgotPassword(email), {
        loading: 'Requesting Change of passsword...',
        success: (message) => {
          return message;
        },
        error: (error) => {
          return error.message;
        },
      });
      helpers.setSubmitting(false);
    },
  });

  useEffect(() => {
    (async () => {
      if (router.query?.auth === 'false') {
        signOut();
      }
    })();
  }, [signOut, router.query?.auth]);

  return (
    <>
      <Head>
        <title>Forgot password | Cjtronics Admin</title>
      </Head>
      <Box
        sx={{
          backgroundColor: theme.palette.primary.navy,
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
              <Typography variant="h3" color="white">
                Forgot password
              </Typography>
              <Typography variant="p" color="white">
                Enter your email the form below to reset your password
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
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
                  sx={{
                    '& input': {
                      color: 'white',
                    },
                  }}
                />
                <Link
                  href={`/auth/login${formik.values.email ? `?email=${formik.values.email}` : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography color="neutral.400">I remember my password</Typography>
                </Link>
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                disabled={!formik.isValid || formik.isSubmitting}
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
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
