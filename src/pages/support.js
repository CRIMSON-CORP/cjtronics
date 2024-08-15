import { Send } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  Stack,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      message: '',
      submit: null,
    },
    validationSchema: Yup.object({
      message: Yup.string().max(255).required('A Message is required'),
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
        <title>Support | Dalukwa Admin</title>
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
            <CardHeader title="Support" />
            <CardContent>
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  <FormControl variant="outlined">
                    <TextField
                      error={!!(formik.touched.message && formik.errors.message)}
                      fullWidth
                      helperText={formik.touched.message && formik.errors.message}
                      label="Message"
                      placeholder="Tell us the error you've encountered."
                      name="message"
                      id="message"
                      multiline
                      minRows={7}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="text"
                      value={formik.values.message}
                    />
                  </FormControl>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<Send />}
                    disabled={!(formik.isValid && formik.dirty)}
                  >
                    Send message
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
