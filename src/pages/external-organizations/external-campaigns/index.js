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
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.reference);
  }, [customers]);
};

const Page = ({ campaigns, externalOrganizations }) => {
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
            <Typography variant="h5">External Campaigns({campaigns.totalRows})</Typography>
            <Filters externalOrganizations={externalOrganizations} />
            <CampaignsTable campaigns={campaigns} />
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
        campaigns,
        externalOrganizations,
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

function Filters({ externalOrganizations }) {
  const { query, replace } = useRouter();
  const [selectedOrganization, setselectedOrganization] = useState(
    query.external_organization || ''
  );
  const [status, setStatus] = useState(query.status || '');

  function handleExternalOrganizationSelect(event) {
    const queryParams = new URLSearchParams(query);
    queryParams.set('organization', event.target.value);
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setselectedOrganization(event.target.value);
  }
  function handleStatusSelect(event) {
    const queryParams = new URLSearchParams(query);
    queryParams.set('status', event.target.value);
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
    setStatus(event.target.value);
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
            {externalOrganizations.list.map((screen) => (
              <MenuItem value={screen.reference} key={screen.reference}>
                {screen.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} md={6} lg={3}>
        <FormControl fullWidth>
          <InputLabel id="status">Select Status</InputLabel>
          <Select
            labelId="status"
            id="status-select"
            value={status}
            label="Select Status"
            onChange={handleStatusSelect}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
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

function CampaignsTable({ campaigns }) {
  const { list } = campaigns;

  const { replace, query } = useRouter();

  const handleRowsPerPageChange = useCallback((event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('size', event.target.value);
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    replace(`/external-organizations/external-campaigns?${queryParams.toString()}`);
  };

  const customersIds = useCustomerIds(list);

  const customersSelection = useSelection(customersIds);

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Starts at</TableCell>
                <TableCell>Ends at</TableCell>
                <TableCell>Play Duration</TableCell>
                <TableCell sx={{ minWidth: 300 }}>Play Days</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {list.length === 0 && (
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
              {list.map((campaign) => {
                return (
                  <TableRow hover key={campaign.reference}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {campaign.startAt &&
                          formatter.format(new Date(`${campaign.startAt} ${campaign.playFrom}`))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {campaign.endAt &&
                          formatter.format(new Date(`${campaign.endAt} ${campaign.playTo}`))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.playDuration}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        {campaign.playDays?.split(',')?.map((day) => (
                          <Chip key={day} label={day} sx={{ textTransform: 'capitalize' }} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        sx={{ textTransform: 'uppercase' }}
                        color={colorStatusMap[campaign.status]}
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
        count={+campaigns.totalRows}
        onPageChange={onPageChange}
        page={+campaigns.currentPage - 1}
        rowsPerPage={+campaigns.rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 30]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}

const colorStatusMap = {
  pending: 'warning',
  approved: 'success',
  declined: 'error',
};
