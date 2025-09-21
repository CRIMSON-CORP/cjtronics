import { Box, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getCompanies, getUsers } from 'src/lib/actions';
import { CompaniesTable } from 'src/sections/customer/companies-table';

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.reference);
  }, [customers]);
};

const Page = ({ companies, users }) => {
  const page = companies.currentPage - 1;
  const customersIds = useCustomerIds(companies.list);
  const customersSelection = useSelection(customersIds);

  const { replace, query } = useRouter();

  const handleRowsPerPageChange = useCallback((event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('size', event.target.value);
    replace(`/users/companies?${queryParams.toString()}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    replace(`/users/companies?${queryParams.toString()}`);
  };

  return (
    <>
      <Head>
        <title>Companies | Dalukwa Admin</title>
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
            <Typography variant="h5">Companies({companies.totalRows})</Typography>
            <CompaniesTable
              count={+companies.totalRows}
              items={companies.list}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={onPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              selected={customersSelection.selected}
              rowsPerPage={+companies.rowsPerPage}
              pageSizeOptions={[5, 10, 25, 30]}
              users={users}
            />
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
    const [companies, { users }] = await Promise.all([
      getCompanies(ctx.req, params),
      getUsers(ctx.req),
    ]);
    return {
      props: { companies, users },
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
