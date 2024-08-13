import { useCallback, useMemo } from 'react';
import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/customer/customers-table';
import { applyPagination } from 'src/utils/apply-pagination';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import useTableFilter from 'src/hooks/useTableFilter';
import Filter from 'src/components/Filter';
import useFetch from 'src/hooks/useFetch';

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

  const [roles = []] = useFetch('/get/roles', 'roles');

  const tableFilterOptions = useMemo(
    () => [
      {
        fieldKey: 'search',
        title: 'Search',
        type: 'string',
        value: '',
      },
      {
        fieldKey: 'filter[active]',
        title: 'Active Users',
        type: 'option',
        list: [
          { render: 'Active', value: true },
          { render: 'InActive', value: false },
        ],
        value: '',
      },
      {
        fieldKey: 'filter[blocked]',
        title: 'Blocked Users',
        type: 'option',
        list: [
          { render: 'Blocked', value: true },
          { render: 'UnBlocked', value: false },
        ],
        value: '',
      },
      {
        fieldKey: 'filter[role]',
        title: 'Roles',
        type: 'option',
        list: roles.map((role) => ({ render: role.name, value: role._id })),
        value: '',
      },
    ],
    [roles]
  );

  const { filterParams, setFilterParams, onPageChange } = useTableFilter(
    page + 1,
    tableFilterOptions
  );

  const handleRowsPerPageChange = useCallback(() => {}, []);

  const rowsPerPage = Math.min(users.length, 25);

  return (
    <>
      <Head>
        <title>Users | Dalukwa Admin</title>
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
            <Typography variant="h4">Users({total_results})</Typography>
            <Filter filterParams={filterParams} setFilterParams={setFilterParams} />
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
  const urlParams = new URLSearchParams(params).toString();

  try {
    const {
      data: { data },
    } = await axios.get(`/admin/user/list?${urlParams}`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    return {
      props: data,
    };
  } catch (error) {
    console.log(error);
    return {
      notFound: true,
    };
  }
});

export default Page;
