import { Box, Container, Stack, Typography } from '@mui/material';
import Head from 'next/head';
import { useCallback, useMemo } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { OrganizationsTable } from 'src/sections/customer/organizations-table';

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.reference);
  }, [customers]);
};

const Page = ({ organizations }) => {
  const page = organizations.currentPage - 1;

  const customersIds = useCustomerIds(organizations.list);
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
        <title>External Organizations | Dalukwa Admin</title>
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
            <Stack flexWrap="wrap" gap={3} direction="row" justifyContent="space-between">
              <Typography variant="h5">
                External Organizations({organizations.totalRows})
              </Typography>
            </Stack>
            <OrganizationsTable
              page={page}
              onPageChange={onPageChange}
              items={organizations.list}
              count={organizations.totalRows}
              pageSizeOptions={[5, 10, 25, 30]}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              selected={customersSelection.selected}
              rowsPerPage={+organizations.rowsPerPage}
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
    size: ctx.query.size || 25,
  };

  try {
    const organizations = await getResourse(ctx.req, '/external/organization', params);
    return {
      props: { organizations },
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
