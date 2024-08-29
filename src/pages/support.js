import { Send } from '@mui/icons-material';
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
      message: '',
      submit: null,
    },
    validationSchema: Yup.object({
      message: Yup.string().max(255).required('A Message is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        await toast.promise(axios.post('/api/admin/support/send', values), {
          loading: 'Sending message...',
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
                    type="submit"
                    endIcon={
                      formik.isSubmitting ? (
                        <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                      ) : (
                        <Send />
                      )
                    }
                    variant="contained"
                    size="large"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
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
