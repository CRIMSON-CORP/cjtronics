import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import * as Yup from 'yup';

const Page = () => {
  const router = useRouter();
  const { resetData } = router.query;

  const emailPrams = router.query.email;
  const { resetPassword, signOut } = useAuth();
  const theme = useTheme();
  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
      submit: null,
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().max(255).required('New Password is required'),
      confirmPassword: Yup.string()
        .max(255)
        .required('Confirm Password is required')
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);

      await toast.promise(resetPassword({ ...values, email: resetData[0], token: resetData[1] }), {
        loading: 'Reseting your password, hang on...',
        success: (message) => {
          router.push('/auth/login');
          return message;
        },
        error: (error) => {
          return error.message;
        },
      });
      helpers.setSubmitting(false);
    },
  });

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handleClickShowPassword = (key) => () =>
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));

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
        <title>Reset Password | Cjtronics Admin</title>
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
                Reset your Password
              </Typography>
              <Typography variant="p" color="white">
                Enter the new passsword to continue
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3} color={theme.palette.neutral['50']}>
                <FormControl>
                  <TextField
                    error={!!(formik.touched.newPassword && formik.errors.newPassword)}
                    fullWidth
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                    label="New Password"
                    name="newPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type={showPassword.newPassword ? 'text' : 'password'}
                    value={formik.values.newPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword('newPassword')}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
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
                <FormControl>
                  <TextField
                    error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    fullWidth
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    label="Confirm Password"
                    name="confirmPassword"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    value={formik.values.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowPassword('confirmPassword')}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
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
                <Link href="/auth/login" style={{ textDecoration: 'none' }}>
                  <Typography color="neutral.400">I remember my password</Typography>
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
