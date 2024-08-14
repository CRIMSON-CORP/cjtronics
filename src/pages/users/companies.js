import { Box, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useCallback, useMemo } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CompaniesTable } from 'src/sections/customer/companies-table';
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
            <Typography variant="h5">Companies({total_results})</Typography>
            <CompaniesTable
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

  // try {
  //   const {
  //     data: { data },
  //   } = await axios.get(`/admin/user/list?${urlParams}`, {
  //     headers: {
  //       Authorization: `Bearer ${userAuthToken}`,
  //     },
  //   });

  //   return {
  //     props: data,
  //   };
  // } catch (error) {
  //   console.log(error);
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {
      users: [
        {
          accountServiceManagerId: '633c408ffc79025375eb8a2a',
          adAccountManager: 'Oluwatayo Oredugba',
          adAccountManagerEmail: 'oluwatayo@folham.com',
          adAccountManagerPhoneNumber: '08032371888',
          companyAbbreviation: 'COM1',
          companyActiveStatus: 1,
          companyName: 'Company 1',
          createdAt: '2022-10-11T06:43:33.673Z',
          updatedAt: '2022-10-11T06:43:33.673Z',
        },
      ],
      total_results: 1,
      pager_current_page: 1,
    },
  };
});

export default Page;
