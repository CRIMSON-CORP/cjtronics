import { Box, Button, FormControl, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import * as Yup from 'yup';

const Page = () => {
  const router = useRouter();
  const emailPrams = router.query.email;
  const { signIn, signOut } = useAuth();
  const theme = useTheme();
  const formik = useFormik({
    initialValues: {
      email: emailPrams || '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
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
        <title>Create Account | Cjtronics Admin</title>
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
                CreateAccount
              </Typography>
              <Typography variant="p" color="white">
                Enter the form below to create your account
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3} color={theme.palette.neutral['50']}>
                <FormControl variant="outlined">
                  <TextField
                    error={!!(formik.touched.email && formik.errors.email)}
                    fullWidth
                    helperText={formik.touched.email && formik.errors.email}
                    label="Email Address"
                    name="email"
                    id="email"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type="email"
                    value={formik.values.email}
                  />
                </FormControl>
                <Typography>
                  Already have an account?{' '}
                  <Link
                    style={{ textDecoration: 'none' }}
                    href={`/auth/forgot-password${
                      formik.values.email ? `?email=${formik.values.email}` : ''
                    }`}
                  >
                    <Typography component="span" color="primary">
                      Request OTP
                    </Typography>
                  </Link>
                </Typography>
              </Stack>
              {formik.errors.submit && (
                <Typography color="error" sx={{ mt: 3 }} variant="body2">
                  {formik.errors.submit}
                </Typography>
              )}
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                variant="contained"
                disabled={!(formik.isValid && formik.dirty)}
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
