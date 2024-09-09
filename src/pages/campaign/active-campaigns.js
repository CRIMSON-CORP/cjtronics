import {
  Box,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaigns }) => {
  return (
    <>
      <Head>
        <title>Active campaigns | Cjtronics Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h5">Active campaigns({campaigns.totalRows})</Typography>
            <Activecampaigns campaigns={campaigns} />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

const columns = [
  { id: 'campaigns', label: 'Campaigns', minWidth: 170 },
  { id: 'ad_accounts', label: 'Ad Accounts', minWidth: 100 },
  { id: 'screen_name', label: 'Screen Name', minWidth: 100 },
];

function Activecampaigns({ campaigns }) {
  const { query, replace } = useRouter();
  const handleRowsPerPageChange = useCallback((event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('size', event.target.value);
    queryParams.delete('screen_id');
    replace(`/campaign/active-campaigns?${queryParams.toString()}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    queryParams.delete('screen_id');
    replace(`/campaign/active-campaigns?${queryParams.toString()}`);
  };

  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '60vh' }}>
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
            {campaigns.list.map((campaign) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={campaign.reference}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.accountName}</TableCell>
                  <TableCell>{campaign.screenName}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={+campaigns.totalRows}
        rowsPerPage={+campaigns.rowsPerPage}
        page={+campaigns.currentPage - 1}
        onPageChange={onPageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  try {
    const campaigns = await getResourse(ctx.req, `/campaign/active`, params);

    return {
      props: {
        campaigns,
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
