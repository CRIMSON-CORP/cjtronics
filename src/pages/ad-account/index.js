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
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useAuth } from 'src/hooks/use-auth';
import useToggle from 'src/hooks/useToggle';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllOrganizations, getAllScreens, getCompanies } from 'src/lib/actions';
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

const superAdminRef = process.env.NEXT_PUBLIC_SUPER_ADMIN_ORGANIZATION_REF;

function AdAccountForm({ organizations, companies, screens }) {
  const { user } = useAuth();
  const defaultOrganizationReference = user?.organizationReference || '';
  const isSuperAdmin = defaultOrganizationReference === superAdminRef;
  const formik = useFormik({
    initialValues: {
      organizationId: defaultOrganizationReference,
      companyId: '',
      screenId: '',
      name: '',
      submit: null,
    },
    validationSchema: Yup.object({
      ...(isSuperAdmin
        ? {}
        : { organizationId: Yup.string().required('Organization is required') }),
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
                label="Select Organization"
                name="organizationId"
                id="organizationId"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.organizationId}
                disabled={!isSuperAdmin}
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
                label="Select Company name"
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
              Add Ad Account
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}

function AdAccountsListWrapper() {
  const [selectedAdCompanyReference, setSelectedAdCompanyReference] = useState('');
  const [adAccounts, setAdAccounts] = useState([]);
  const [fetchingAdAccounts, setFetchingAdAccounts] = useState(false);

  const fetchAdAccounts = async (reference) => {
    try {
      const response = await axios.get(
        '/api/admin/ad-account/get-by-company?reference=' + reference
      );
      setFetchingAdAccounts(false);
      setAdAccounts(response.data.data.list);
    } catch (error) {}
  };
  useEffect(() => {
    const refetchAddAccounts = (e) => {
      setFetchingAdAccounts(true);
      fetchAdAccounts(e.detail);
      setSelectedAdCompanyReference(e.detail);
    };
    window.addEventListener('refetch-ad-accounts', refetchAddAccounts);

    return () => {
      window.removeEventListener('refetch-ad-accounts', refetchAddAccounts);
    };
  }, []);

  if (!selectedAdCompanyReference && !fetchingAdAccounts) {
    return (
      <Card>
        <CardContent>
          <Typography>Select company to see Ad Accounts</Typography>
        </CardContent>
      </Card>
    );
  }

  if (fetchingAdAccounts) {
    return (
      <Card>
        <CardContent>
          <List>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <Skeleton variant="circular" animation="wave" width={40} height={40} />
                    </Avatar>
                  </ListItemAvatar>
                  <Skeleton variant="text" animation="wave" width="100%" />
                </ListItem>
              ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  return <AdAccountList adAccounts={adAccounts} />;
}

function AdAccountList({ adAccounts }) {
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
              Ad Accounts <Chip label={adAccounts.length} />
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        <List sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {adAccounts.map((adAccount) => (
            <AdCampaignWrapper key={adAccount.reference} {...adAccount} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function AdCampaignWrapper({ name, reference, listCampaigns }) {
  const { state, toggle } = useToggle(false);
  const { push } = useRouter();

  const deleteAdAccount = async () => {
    await toast.promise(axios.post('/api/admin/ad-account/delete', { reference }), {
      loading: 'Deleting Campaign, hold on a moment...',
      success: (response) => {
        return response.data.message;
      },
      error: (err) => {
        return err.response?.data?.message || err.message;
      },
    });
  };

  const deleteCampaign = (reference) => async () => {
    await toast.promise(axios.post('/api/admin/campaigns/delete', { reference }), {
      loading: 'Deleting Campaign, hold on a moment...',
      success: (response) => {
        return response.data.message;
      },
      error: (err) => {
        return err.response?.data?.message || err.message;
      },
    });
  };

  const goToAdAccount = () => push(`/ad-account/${reference}`);

  const goToCampaign = (reference) => () => push(`/campaign/edit-campaign/${reference}`);

  return (
    <>
      <ListItem
        secondaryAction={
          <Stack direction="row" spacing={1}>
            <ConfirmAction
              action={deleteAdAccount}
              title={`Delete Ad Account -  ${name}`}
              content="Are you sure you want to delete this Ad Account?"
              proceedText="Yes, Delete"
              color="error"
              trigger={
                <IconButton>
                  <Delete color="error.main" />
                </IconButton>
              }
            />
            <IconButton onClick={toggle}>{state ? <ExpandLess /> : <ExpandMore />}</IconButton>
            <Link href={`/ad-account/${reference}`}>
              <IconButton>
                <ChevronRight />
              </IconButton>
            </Link>
          </Stack>
        }
      >
        <ListItemAvatar>
          <Avatar>
            <Campaign />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={name}
          onClick={goToAdAccount}
          sx={{ cursor: 'pointer' }}
          secondary={`${listCampaigns.length} campaigns`}
        />
      </ListItem>
      <Collapse in={state} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {listCampaigns.map((campaign) => (
            <ListItem
              sx={{ pl: 4 }}
              key={campaign.reference}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <ConfirmAction
                    action={deleteCampaign(campaign.reference)}
                    title={`Delete Camaping -  ${campaign.name}`}
                    content="Are you sure you want to delete this Campaign?"
                    proceedText="Yes, Delete"
                    color="error"
                    trigger={
                      <IconButton>
                        <Delete color="error.main" />
                      </IconButton>
                    }
                  />
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <Campaign />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                sx={{ cursor: 'pointer' }}
                onClick={goToCampaign(campaign.reference)}
                primary={campaign.name}
              />
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
    companies.list = companies.list.filter((company) => company.isActive);
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
