import { Box, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import handleGSSPError from 'src/utils/handle-gssp-error';
import { CustomersTable } from 'src/sections/customer/customers-table';

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};

const Page = ({ users, total_results, current_page, rows_per_page }) => {
  const page = current_page - 1;

  const { replace, query } = useRouter();

  const customersIds = useCustomerIds(users);

  const customersSelection = useSelection(customersIds);

  const handleRowsPerPageChange = useCallback((event) => {
    replace(`/users?size=${event.target.value}&${query.page ? `page=${query.page}` : ''}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    replace(`/users?page=${newPage + 1}&${query.size ? `size=${query.size}` : ''}`);
  };

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
              rowsPerPage={parseInt(rows_per_page)}
              pageSizeOptions={[5, 10, 25, 30]}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = async (ctx) => {
  const userAuthToken = ctx.req.cookies['_cjtronics_cookie_admin'];
  const params = {
    ...ctx.query,
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  try {
    const { data } = await axios.get(`/users`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
      params,
    });

    return {
      props: {
        users: data.data.users,
        total_results: data.data.totalRows,
        current_page: data.data.currentPage,
        rows_per_page: data.data.rowsPerPage,
      },
    };
  } catch (error) {
    return handleGSSPError(error, ctx);
  }
};

export default Page;
