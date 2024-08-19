import { Box, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useCallback, useMemo } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { applyPagination } from 'src/utils/apply-pagination';

const useCustomers = (users, page) => {
  return useMemo(() => {
    return applyPagination(users, page);
  }, [users, page]);
};

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};

const Page = ({ users, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;
  const customers = useCustomers(users, page);
  const customersIds = useCustomerIds(customers);
  const customersSelection = useSelection(customersIds);

  const handleRowsPerPageChange = useCallback(() => {}, []);

  const onPageChange = () => {};

  const rowsPerPage = Math.min(users.length, 25);

  return (
    <>
      <Head>
        <title>Users | Cjtronics Admin</title>
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
            <Typography variant="h5">Users({total_results})</Typography>
            <CustomersTable
              count={total_results}
              items={users}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={onPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              selected={customersSelection.selected}
              rowsPerPage={rowsPerPage}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
  };
  try {
    const { data } = await axios.get(`/users/all`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    return {
      props: {
        users: data.data,
        total_results: 2,
        pager_current_page: 1,
      },
    };
  } catch (error) {
    if (error.response.status === 401) {
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

  // return {
  //   props: {
  //     users: [
  //       {
  //         createdAt: '2024-08-07T23:10:31.980Z',
  //         email: 'aa@aa.com',
  //         firstName: 'aa',
  //         lastName: 'aa',
  //         organizationId: '64ae8231564cd6a76b7b2a42',
  //         privilege: 'user',
  //         type: 'individual',
  //         updatedAt: '2024-08-07T23:10:31.980Z',
  //         userActiveStatus: 1,
  //         username: 'aa.aa',
  //       },
  //     ],
  //     total_results: 1,
  //     pager_current_page: 1,
  //   },
  // };
});

export default Page;
