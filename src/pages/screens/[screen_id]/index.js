import { Delete, Edit, HelpOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Unstable_Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ScreenLayout from 'src/components/ScreenLayout';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import * as Yup from 'yup';

const campaings = [
  {
    _id: '64b64ca8bae11621a2433fda',
    adAccount: {
      _id: '64b646dbbae11621a243387a',
      name: 'Mysogi for Bishop Aboyade',
      adCompany: '63c5075b0e0feeed9fc893bb',
      adScreen: '64b6469bbae11621a243380c',
      adAccountName: 'MYSOGI-Mysogi for Bishop Aboyade | BISHOP ABOYADE',
      order: 1,
      organizationId: '64b646dbbae11621a2433879',
      createdAt: '2023-07-18T08:01:31.407Z',
      updatedAt: '2023-11-04T10:17:32.450Z',
      __v: 0,
    },
    adScreen: '64b6469bbae11621a243380c',
    name: 'Suzuki Grand Vitara',
    startDate: '2023-12-21T00:00:00.000Z',
    endDate: '2023-12-25T00:00:00.000Z',
    videoAndImageDuration: 10,
    startTime: '00:00',
    endTime: '23:59',
    campaignScheduleDays: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    campaignActiveStatus: 0,
    adFiles: ['6583f86dc1084a70af47709e'],
    organizationId: '64b646dbbae11621a2433879',
    createdAt: '2023-07-18T08:26:16.443Z',
    updatedAt: '2024-01-26T17:36:41.256Z',
    __v: 0,
    screenViewPort: 1,
  },
];

const Page = () => {
  const { query } = useRouter();
  const [selectedScreen, setSelectedScreen] = useState(query.screen_id);

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Screen campaign | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Screen campaign</Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                  <Select
                    labelId="scrren-select-label"
                    id="screen-select"
                    value={selectedScreen}
                    label="Select Screen"
                    onChange={handleScreenSelect}
                  >
                    <MenuItem value="123">Mysogi</MenuItem>
                    <MenuItem value="10">Ten</MenuItem>
                    <MenuItem value="10">Twenty</MenuItem>
                    <MenuItem value="10">Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <ScreenCampaings campaings={campaings} />
            <ScreenDetails />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

const columns = [
  { id: 'campaings', label: 'Campaings', minWidth: 170 },
  { id: 'ad_accounts', label: 'Ad Accounts', minWidth: 100 },
];

function ScreenCampaings({ campaings }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {campaings.map((campaing) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={campaing._id}>
                  <TableCell>{campaing.name}</TableCell>
                  <TableCell>{campaing.adAccount.name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={campaings.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
}

function ScreenDetails() {
  return (
    <Card>
      <CardHeader
        title={
          <Stack justifyContent="space-between" direction="row" flexWrap="wrap" spacing={2}>
            <Typography variant="h5">Screen Details</Typography>
            <Stack direction="row" spacing={1}>
              <EditScreen />
              <Button startIcon={<Delete />} color="error">
                Delete
              </Button>
            </Stack>
          </Stack>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography>Screen Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography>BISHOP ABOYADE</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Layout</Typography>
                </TableCell>
                <TableCell>
                  <Typography>Landscape-Full</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Screen Output Size(W x H):</Typography>
                </TableCell>
                <TableCell>
                  <Typography>1280 x 720</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Screen ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography>FOL-ABO</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Device ID</Typography>
                </TableCell>
                <TableCell>
                  <Typography>RDID1Z</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Selected Layout</Typography>
                </TableCell>
                <TableCell>
                  <Box maxWidth={300}>
                    <ScreenLayout full horizontal landscape />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Notificatons</Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel control={<Switch defaultChecked />} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography>Scrolling Banner</Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel control={<Switch defaultChecked />} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
};

function EditScreen() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const openModal = () => {
    setEditModalOpen(true);
  };
  const closeModal = () => {
    setEditModalOpen(false);
  };
  return (
    <>
      <Button onClick={openModal} startIcon={<Edit />}>
        Edit
      </Button>
      <Modal open={editModalOpen} onClose={closeModal}>
        <Box sx={modalStyles}>
          <EditScreenForm />
        </Box>
      </Modal>
    </>
  );
}

const cardStyles = {
  maxWidth: 700,
  maxHeight: '85vh',
  overflowY: 'auto',
};

const EditScreenForm = ({}) => {
  const formik = useFormik({
    initialValues: {
      screen_id: '',
      screen_name: '',
      screen_height: '',
      screen_width: '',
      screen_layout: '',
      unique_device_id: '',
      ad_account_manager_name: '',
      ad_account_manager_email: '',
      ad_account_manager_phone_number: '',
      account_officer: '',

      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      screen_id: Yup.string().max(255).required('Screen ID is required'),
      screen_name: Yup.string().max(255).required('Screen Name is required'),
      screen_height: Yup.string().max(255).required('Screen Height is required'),
      screen_width: Yup.string().max(255).required('Screen Width is required'),
      screen_layout: Yup.string().max(255).required('Screen Layout is required'),
      unique_device_id: Yup.string().max(255).required('Device ID is required'),
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
    <Card sx={cardStyles}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5">Edit Screen</Typography>
            <Tooltip title={<ToolTipContent />}>
              <IconButton>
                <HelpOutline />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screen_id && formik.errors.screen_id)}
                fullWidth
                helperText={formik.touched.screen_id && formik.errors.screen_id}
                label="Screen ID"
                name="screen_id"
                id="screen_id"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.screen_id}
              />
              <FormHelperText>e.g FLH2</FormHelperText>
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screen_name && formik.errors.screen_name)}
                fullWidth
                helperText={formik.touched.screen_name && formik.errors.screen_name}
                label="Screen Name"
                name="screen_name"
                id="screen_name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.screen_name}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screen_height && formik.errors.screen_height)}
                fullWidth
                helperText={formik.touched.screen_height && formik.errors.screen_height}
                label="Screen Height"
                name="screen_height"
                id="screen_height"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.screen_height}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.screen_width && formik.errors.screen_width)}
                fullWidth
                helperText={formik.touched.screen_width && formik.errors.screen_width}
                label="Screen Width"
                name="screen_width"
                id="screen_width"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.screen_width}
              />
            </FormControl>
            <Divider />
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.unique_device_id && formik.errors.unique_device_id)}
                fullWidth
                helperText={formik.touched.unique_device_id && formik.errors.unique_device_id}
                label="Unique Device ID"
                name="unique_device_id"
                id="unique_device_id"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.ad_account_manager_email}
              />
            </FormControl>
            <Divider />
            <Typography variant="subtitle1">Select Screen Layout</Typography>
            <Stack>
              <Grid container spacing={{ xs: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    full
                    landscape
                    formik={formik}
                    name="screen_layout"
                    value="landspace-full"
                    title="Landscape Full"
                  />
                </Grid>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    landscape
                    split="80%,20%"
                    formik={formik}
                    name="screen_layout"
                    value="landspace-80-20"
                    title="Landscape 80/20"
                  />
                </Grid>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    landscape
                    split="50%,50%"
                    horizontal
                    formik={formik}
                    name="screen_layout"
                    value="landspace-50-50"
                    title="Landscape Split"
                  />
                </Grid>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    landscape={false}
                    full
                    formik={formik}
                    name="screen_layout"
                    value="portrait-full"
                    title="Portrait"
                  />
                </Grid>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    landscape={false}
                    split="80%,20%"
                    formik={formik}
                    name="screen_layout"
                    value="portrait-80-20"
                    title="Portrait 80/20"
                  />
                </Grid>
                <Grid xs={2} sm={4} md={4}>
                  <ScreenLayout
                    landscape={false}
                    split="50%,50%"
                    horizontal={false}
                    formik={formik}
                    name="screen_layout"
                    value="portrait-split"
                    title="Portrait Split"
                  />
                </Grid>
              </Grid>
              {!!(formik.touched.screen_layout && formik.errors.screen_layout) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.screen_layout}
                </FormHelperText>
              )}
            </Stack>
            <Button variant="contained" size="large" disabled={!(formik.isValid && formik.dirty)}>
              Update Screen
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

function ToolTipContent() {
  return (
    <div>
      <h3>How to link the mobile application to screen</h3>
      <ol>
        <li>Download the apk</li>
        <li>Install the apk on the device</li>
        <li>Copy device Id generated on the device</li>
        <li>
          Use device Id generated to create new screen details on cj tronics by folham's application
        </li>
        <li>Proceed to create campaign with the newly created screen details</li>
        <li>Start up the device and begin to view your adverts</li>
      </ol>
    </div>
  );
}
