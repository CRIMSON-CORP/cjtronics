import { Campaign, ChevronRight, Delete, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
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
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllOrganizations, getAllScreens, getCompanies } from 'src/lib/actions';
import { adAccountCampaigns } from 'src/utils/data';
import * as Yup from 'yup';

const Page = ({ organizations, companies, screens }) => {
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
              <AdAccountForm {...{ organizations, companies, screens }} />
            </Grid>
            <Grid xs={12} md={6}>
              <AdAccountsListWrapper />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function AdAccountForm({ organizations, companies, screens, setSelectedCompany }) {
  const formik = useFormik({
    initialValues: {
      organizationId: '',
      companyId: '',
      screenId: '',
      name: '',
      submit: null,
    },
    validationSchema: Yup.object({
      organizationId: Yup.string().required('Organization is required'),
      companyId: Yup.string().max(255).required('Company Name is required'),
      screenId: Yup.string().max(255).required('Screen is required'),
      name: Yup.string().max(255).required('Ad Account name is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);

      await toast.promise(axios.post('/api/admin/ad-account/create', values), {
        loading: 'Creatiing Ad Account, Please wait...',
        success: (response) => {
          helpers.setStatus({ success: true });
          helpers.resetForm();
          dispatchRefetchAdAccounts();
          return response.data.message;
        },
        error: (error) => error.response?.data?.message || error.message,
      });

      helpers.setSubmitting(false);
    },
  });

  const dispatchRefetchAdAccounts = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('refetch-ad-accounts', {
        detail: formik.values.companyId,
      })
    );
  }, [formik.values.companyId]);

  useEffect(() => {
    if (formik.values.companyId) {
      dispatchRefetchAdAccounts();
    }
  }, [formik.values.companyId]);

  return (
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
                error={!!(formik.touched.organizationId && formik.errors.organizationId)}
                fullWidth
                label="Account Officer"
                name="organizationId"
                id="organizationId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.organizationId}
              >
                {organizations.list.map((organization) => (
                  <MenuItem key={organization.id} value={organization.reference}>
                    {organization.name}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.organizationId && formik.errors.organizationId) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.organizationId}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="organization">Select Company name</InputLabel>
              <Select
                error={!!(formik.touched.companyId && formik.errors.companyId)}
                fullWidth
                label="Account Officer"
                name="companyId"
                id="companyId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.companyId}
              >
                {companies.list.map((company) => (
                  <MenuItem key={company.id} value={company.reference}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.companyId && formik.errors.companyId) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.companyId}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="scrren-select-label">Select Screen</InputLabel>
              <Select
                error={!!(formik.touched.screenId && formik.errors.screenId)}
                labelId="scrren-select-label"
                id="screen-select"
                name="screenId"
                value={formik.values.screenId}
                label="Select Screen"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              >
                {screens.screen.map((screen) => (
                  <MenuItem value={screen.reference} key={screen.reference}>
                    {screen.screenName}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.screenId && formik.errors.screenId) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.screenId}
                </FormHelperText>
              )}
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.name && formik.errors.name)}
                fullWidth
                helperText={formik.touched.name && formik.errors.name}
                label="Ad Account Name"
                name="name"
                id="name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.name}
              />
            </FormControl>
            <Button
              type="submit"
              startIcon={
                formik.isSubmitting && (
                  <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                )
              }
              variant="contained"
              size="large"
              disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
            >
              Add Company
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

function AdAccountsListWrapper() {
  const [companyId, setCompanyId] = useState(null);

  const fetchAdAccounts = async (reference) => {
    try {
      const response = await axios.get(
        '/api/admin/ad-account/get-by-company?reference=' + reference
      );
      console.log(response);
    } catch (error) {}
  };
  useEffect(() => {
    const refetchAddAccounts = (e) => {
      setCompanyId(e.detail);
      fetchAdAccounts(e.detail);
    };
    window.addEventListener('refetch-ad-accounts', refetchAddAccounts);

    return () => {
      window.removeEventListener('refetch-ad-accounts', refetchAddAccounts);
    };
  }, []);

  if (!companyId) {
    return (
      <Card>
        <CardContent>
          <Typography>Select company to see Ad Accounts</Typography>
        </CardContent>
      </Card>
    );
  }
  return <AdAccountList adAccountName={companyId} />;
}

function AdAccountList({ adAccountName }) {
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
        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {adAccountCampaigns.adAccountAndCampaigns.map((campaign) => (
            <AdCampaignWrapper key={campaign.adAccountId} {...campaign} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function AdCampaignWrapper({ adAccount, campaigns }) {
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
        <ListItemText primary={adAccount} secondary={`${campaigns.length} campaigns`} />
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {campaigns.map((campaign) => (
            <ListItem
              key={campaign._id}
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
              <ListItemText primary={campaign.name} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [organizations, companies, screens] = await Promise.all([
      getAllOrganizations(ctx.req),
      getCompanies(ctx.req),
      getAllScreens(ctx.req),
    ]);
    return {
      props: { organizations, companies, screens },
    };
  } catch (error) {
    console.log(error);

    if (error?.response?.status === 401) {
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
});
