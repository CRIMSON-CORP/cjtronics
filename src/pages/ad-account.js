import { Campaign, ChevronRight, Delete, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Container,
  FormControl,
  FormHelperText,
  Unstable_Grid2 as Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useState } from 'react';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { adAccountCampaings } from 'src/utils/data';
import * as Yup from 'yup';

const Page = ({}) => {
  const formik = useFormik({
    initialValues: {
      organization: '',
      company_name: '',
      screen: '',
      ad_account_name: '',
      submit: null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      screen_id: Yup.string().max(255).required('Screen ID is required'),
      company_name: Yup.string().max(255).required('Screen Name is required'),
      screen: Yup.string().max(255).required('Screen is required'),
      ad_account_name: Yup.string().max(255).required('Ad Account name is required'),
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
        <title>Ad Account | Dalukwa Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card>
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5">Create Ad Account</Typography>
                    </Stack>
                  }
                />
                <CardContent>
                  <form onSubmit={formik.handleSubmit}>
                    <Stack spacing={3}>
                      <FormControl variant="outlined">
                        <InputLabel htmlFor="organization">Select Organization</InputLabel>
                        <Select
                          error={!!(formik.touched.organization && formik.errors.organization)}
                          fullWidth
                          label="Account Officer"
                          name="organization"
                          id="organization"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.organization}
                        >
                          <MenuItem value="Ajayi">Ajayi</MenuItem>
                        </Select>
                        {!!(formik.touched.organization && formik.errors.organization) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.organization}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel htmlFor="organization">Select Company name</InputLabel>
                        <Select
                          error={!!(formik.touched.company_name && formik.errors.company_name)}
                          fullWidth
                          label="Company name"
                          name="company_name"
                          id="company_name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.company_name}
                        >
                          <MenuItem value="Ajayi">Ajayi</MenuItem>
                        </Select>
                        {!!(formik.touched.company_name && formik.errors.company_name) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.company_name}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel htmlFor="organization">Select Screen</InputLabel>
                        <Select
                          error={!!(formik.touched.screen && formik.errors.screen)}
                          fullWidth
                          label="Screen"
                          name="screen"
                          id="screen"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.screen}
                        >
                          <MenuItem value="Ajayi">Ajayi</MenuItem>
                        </Select>
                        {!!(formik.touched.screen && formik.errors.screen) && (
                          <FormHelperText sx={{ color: 'error.main' }}>
                            {formik.errors.screen}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl variant="outlined">
                        <TextField
                          error={
                            !!(formik.touched.ad_account_name && formik.errors.ad_account_name)
                          }
                          fullWidth
                          helperText={
                            formik.touched.ad_account_name && formik.errors.ad_account_name
                          }
                          label="Ad Account Name"
                          name="ad_account_name"
                          id="ad_account_name"
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          type="number"
                          value={formik.values.ad_account_name}
                        />
                      </FormControl>
                      <Button
                        variant="contained"
                        size="large"
                        disabled={!(formik.isValid && formik.dirty)}
                      >
                        Add Company
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} md={6}>
              <AdAccountsListWrapper adAccountName={formik.values.company_name} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function AdAccountsListWrapper({ adAccountName }) {
  return (
    <Card>
      <CardHeader
        title={
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="space-between"
          >
            <Typography variant="h5">
              Ad Accounts <Chip label="6" />
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        {adAccountName ? (
          <AdAccountList adAccountName={adAccountName} />
        ) : (
          <Typography>Select company to see Ad Accounts</Typography>
        )}
      </CardContent>
    </Card>
  );
}

function AdAccountList({ adAccountName }) {
  return (
    <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
      {adAccountCampaings.adAccountAndCampaigns.map((campaing) => (
        <AdCampaingWrapper key={campaing.adAccountId} {...campaing} />
      ))}
    </List>
  );
}

function AdCampaingWrapper({ adAccount, campaigns }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };
  return (
    <>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1}>
            <IconButton>
              <Delete color="error.main" />
            </IconButton>
            <IconButton onClick={toggleExpanded}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        }
      >
        <ListItemAvatar>
          <Avatar>
            <Campaign />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={adAccount} secondary={`${campaigns.length} campaings`} />
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {campaigns.map((campaing) => (
            <ListItem
              key={campaing._id}
              sx={{ pl: 4 }}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton>
                    <Delete color="error.main" />
                  </IconButton>
                  <IconButton>
                    <ChevronRight />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <Campaign />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={campaing.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}
