import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      await toast.promise(signIn(values.email, values.password), {
        loading: 'Signing in...',
        success: (message) => {
          router.push(router.query.continueUrl ?? '/');
          return message;
        },
        error: (error) => {
          return error.message;
        },
      });
      helpers.setSubmitting(false);
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    (async () => {
      if (router.query?.auth === 'false') {
        try {
          await signOut();
        } catch (error) {}
      }
    })();
  }, [signOut, router.query?.auth]);

  return (
    <>
      <Head>
        <title>Login | Cjtronics Admin</title>
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
                Welcome back!
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Dont have an account? &nbsp;
                <Link
                  component={NextLink}
                  href="/auth/register"
                  underline="hover"
                  variant="subtitle2"
                >
                  Register
                </Link>
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
                    sx={{
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    error={!!(formik.touched.password && formik.errors.password)}
                    fullWidth
                    helperText={formik.touched.password && formik.errors.password}
                    label="Password"
                    name="password"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& input': {
                        color: 'white',
                      },
                    }}
                  />
                </FormControl>
                <Link
                  component={NextLink}
                  style={{ textDecoration: 'none' }}
                  href={`/auth/forgot-password${
                    formik.values.email ? `?email=${formik.values.email}` : ''
                  }`}
                >
                  <Typography color="neutral.400">Forgot password?</Typography>
                </Link>
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
                disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
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
