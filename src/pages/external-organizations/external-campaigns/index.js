import { Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { DatePicker } from '@mui/x-date-pickers';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Scrollbar } from 'src/components/scrollbar';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaigns, unique_campaigns, screens, externalOrganizations, pagination }) => {
  return (
    <>
      <Head>
        <title>External Campaigns | Cjtronics Admin</title>
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
            <Typography variant="h5">External Campaigns({pagination.totalRows})</Typography>
            <Filters
              screens={screens}
              campaigns={unique_campaigns}
              externalOrganizations={externalOrganizations}
            />
            <CampaignsTable campaigns={campaigns} pagination={pagination} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  try {
    const [campaigns, externalOrganizations] = await Promise.all([
      getResourse(ctx.req, '/external/campaigns', params),
      getResourse(ctx.req, '/external/organization'),
    ]);

    return {
      props: {
        unique_campaigns: campaigns.campaign,
        campaigns: campaigns.list,
        screens: campaigns.adsUnits,
        externalOrganizations,
        pagination: {
          totalRows: campaigns.totalRows,
          currentPage: campaigns.currentPage,
          rowsPerPage: campaigns.rowsPerPage,
        },
      },
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

export default Page;

function Filters({ screens, campaigns, externalOrganizations }) {
  const { query, replace } = useRouter();
  const [selectedOrganization, setselectedOrganization] = useState(query.organizationName || '');
  const [selectedScreen, setSelectedScreen] = useState(query.adunitName || '');
  const [isConfirmed, setIsConfirmed] = useState(query.confirmed === 'true' || '');
  const [selectedDateFrom, setSelectedDateFrom] = useState(
    query.dateFrom ? new Date(query.dateFrom) : null
  );
  const [selectedDateTo, setSelectedDateTo] = useState(
    query.dateTo ? new Date(query.dateTo) : null
  );
  const [selectedCampaign, setSelectedCampaign] = useState(query.campaignName || '');

  function handleExternalOrganizationSelect(event) {
    const queryParams = new URLSearchParams(query);
    if (event.target.value) {
      queryParams.set('organizationName', event.target.value);
    } else {
      queryParams.delete('organizationName');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setselectedOrganization(event.target.value);
  }
  const handleScreenSelect = (event) => {
    const queryParams = new URLSearchParams(query);
    if (event.target.value) {
      queryParams.set('adunitName', event.target.value);
    } else {
      queryParams.delete('adunitName');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setSelectedScreen(event.target.value);
  };
  const handleCampaignSelect = (event) => {
    const queryParams = new URLSearchParams(query);
    if (event.target.value) {
      queryParams.set('campaignName', event.target.value);
    } else {
      queryParams.delete('campaignName');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setSelectedCampaign(event.target.value);
  };

  const handleDateFromChange = (date) => {
    if (selectedDateTo && date > selectedDateTo) {
      toast.error('The start date cannot be later than the end date.');
      return; // Prevent setting the invalid date
    }
    const queryParams = new URLSearchParams(query);
    if (date) {
      queryParams.set('dateFrom', date.toLocaleDateString('en-CA').replaceAll('-', '/'));
    } else {
      queryParams.delete('dateFrom');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setSelectedDateFrom(date);
  };

  const handleDateToChange = (date) => {
    if (selectedDateFrom && date < selectedDateFrom) {
      toast.error('The end date cannot be earlier than the start date.');
      return; // Prevent setting the invalid date
    }
    const queryParams = new URLSearchParams(query);
    if (date) {
      queryParams.set('dateTo', date.toLocaleDateString('en-CA').replaceAll('-', '/'));
    } else {
      queryParams.delete('dateTo');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setSelectedDateTo(date);
  };

  function handleRecordedSelect(event) {
    const queryParams = new URLSearchParams(query);
    if (event.target.value === 'yes' || event.target.value === 'no') {
      queryParams.set('confirmed', event.target.value === 'yes' ? 'true' : 'false');
    } else {
      queryParams.delete('confirmed');
    }
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setIsConfirmed(event.target.value);
  }
  return (
    <Grid container gap={3}>
      <Grid xs={12} md={6} lg={3}>
        <FormControl fullWidth>
          <InputLabel id="scrren-organization-label">Select External Organization</InputLabel>
          <Select
            labelId="scrren-organization-label"
            id="screen-select"
            value={selectedOrganization}
            label="Select External Organization"
            onChange={handleExternalOrganizationSelect}
          >
            <MenuItem value="">All</MenuItem>
            {externalOrganizations.list.map((screen) => (
              <MenuItem value={screen.name} key={screen.reference}>
                {screen.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} sm={6} lg={4}>
        <FormControl fullWidth>
          <InputLabel id="scrren-select-label">Select Ad Unit</InputLabel>
          <Select
            labelId="scrren-select-label"
            id="screen-select"
            name="screenId"
            value={selectedScreen}
            label="Select Screen"
            onChange={handleScreenSelect}
          >
            <MenuItem value="">All</MenuItem>
            {screens.map((screen) => (
              <MenuItem value={screen.name} key={screen.reference}>
                {screen.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} sm={6} lg={4}>
        <FormControl fullWidth>
          <InputLabel id="campaign-select-label">Select Campaign</InputLabel>
          <Select
            labelId="campaign-select-label"
            id="campaign-select"
            value={selectedCampaign}
            label="Select Campaign"
            onChange={handleCampaignSelect}
          >
            <MenuItem value="">All</MenuItem>
            {campaigns.map((campaign) => (
              <MenuItem value={campaign.name} key={campaign.name}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} spacing={3}>
        <Grid container spacing={3}>
          <Grid item>
            <FormControl>
              <DatePicker
                fullWidth
                label="Select Day From"
                value={selectedDateFrom}
                onChange={handleDateFromChange}
              />
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl>
              <DatePicker
                fullWidth
                label="Select Day To"
                value={selectedDateTo}
                onChange={handleDateToChange}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Grid>

      <Grid xs={12} md={6} lg={3}>
        <FormControl fullWidth>
          <InputLabel id="recorded">Filter by Recorded</InputLabel>
          <Select
            labelId="recorded"
            id="recorded-select"
            value={isConfirmed}
            label="Filter by Recorded"
            onChange={handleRecordedSelect}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function CampaignsTable({ campaigns, pagination }) {
  const { replace, query } = useRouter();

  const handleRowsPerPageChange = useCallback(
    (event) => {
      const queryParams = new URLSearchParams(query);
      queryParams.set('size', event.target.value);
      replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    },
    [query, replace]
  );

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
  };

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Ad unit name</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Play Duration</TableCell>
                <TableCell>is Recorded</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {campaigns.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={13}>
                    <Stack justifyContent="center" direction="row">
                      <Typography variant="h6">No Campaigns found</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}

            <TableBody>
              {campaigns.map((campaign) => {
                return (
                  <TableRow hover key={campaign.reference}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.adunitName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatter.format(new Date(`${campaign.createdAt}`))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.playDuration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.isConfirmed ? 'Yes' : 'No'}
                        sx={{ textTransform: 'capitalize' }}
                        color={campaign.isConfirmed ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        LinkComponent={Link}
                        href={`/external-organizations/external-campaigns/${campaign.reference}`}
                      >
                        <Visibility />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={+pagination.totalRows}
        onPageChange={onPageChange}
        page={+pagination.currentPage - 1}
        rowsPerPage={+pagination.rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 30]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}
