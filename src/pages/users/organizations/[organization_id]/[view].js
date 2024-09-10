import { ArrowBackIos } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { SeverityPill } from 'src/components/severity-pill';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';
import { CustomersTable } from 'src/sections/customer/customers-table';

const TableContext = createContext();

const Page = ({ organization, data }) => {
  const { query, replace, push } = useRouter();
  const { organization_id, view } = query;
  const capitalizedView = view.charAt(0).toUpperCase() + view.slice(1);

  const handleRowsPerPageChange = useCallback((event) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('size', event.target.value);
    queryParams.delete('organization_id');
    queryParams.delete('view');
    replace(`/users/organizations/${organization_id}/${view}?${queryParams.toString()}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('page', newPage + 1);
    queryParams.delete('organization_id');
    queryParams.delete('view');
    replace(`/users/organizations/${organization_id}/${view}?${queryParams.toString()}`);
  };

  const goToOrganizations = () => push('/users/organizations');

  const { name } = organization;
  const ViewComponent = viewToComponentMap[view];

  return (
    <>
      <Head>
        <title>
          {capitalizedView} in {name} | Cjtronics Admin
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Button
              startIcon={<ArrowBackIos />}
              onClick={goToOrganizations}
              sx={{ alignSelf: 'flex-start' }}
            >
              Back
            </Button>
            <Typography variant="h5">
              {data.totalRows} {data.totalRows < 2 ? capitalizedView.slice(0, -1) : capitalizedView}{' '}
              in {name}
            </Typography>
            <TableContext.Provider value={{ handleRowsPerPageChange, onPageChange }}>
              <ViewComponent data={data} />
            </TableContext.Provider>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const params = {
    page: ctx.query.page || 1,
    size: ctx.query.size || 25,
  };

  const { organization_id, view } = ctx.query;
  try {
    const [organization, data] = await Promise.all([
      getResourse(ctx.req, `/organization/${organization_id}`),
      getResourse(ctx.req, `/${viewToApiUrlMap[view]}/${organization_id}`, params),
    ]);
    return {
      props: {
        organization,
        data,
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

const viewToApiUrlMap = {
  screens: 'screen/organization',
  users: 'users/organization',
  campaigns: 'campaign/organization',
};

const statusMap = {
  online: 'success',
  offline: 'error',
};

function ScreensTable({ data }) {
  const { screen } = data;
  const { onPageChange, handleRowsPerPageChange } = useContext(TableContext);
  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>Screen Name</TableCell>
                <TableCell>Screen Resolution</TableCell>
                <TableCell>Layout</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Online</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            {screen.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={13}>
                    <Stack justifyContent="center" direction="row">
                      <Typography variant="h4">No Screens found</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}

            <TableBody>
              {screen.map(
                ({
                  screenName,
                  screenId,
                  deviceId,
                  screenWidth,
                  screenHeight,
                  layoutName,
                  screenCity,
                  isOnline,
                  isActive,
                  reference,
                }) => {
                  return (
                    <TableRow hover key={reference}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle1">{screenName}</Typography>
                            <Typography variant="subtitle2">{screenId}</Typography>
                          </Stack>
                          <Chip label={deviceId} />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {screenWidth} x {screenHeight}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{layoutName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{screenCity}</Typography>
                      </TableCell>
                      <TableCell>
                        <SeverityPill color={isOnline ? 'success' : 'error'}>
                          {isOnline ? 'Online' : 'Offline'}
                        </SeverityPill>
                      </TableCell>
                      <TableCell>
                        <SeverityPill color={isActive ? 'success' : 'error'}>
                          {isActive ? 'Online' : 'Offline'}
                        </SeverityPill>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
      <TablePagination
        component="div"
        count={+data.totalRows}
        onPageChange={onPageChange}
        page={+data.currentPage - 1}
        rowsPerPage={+data.rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 30]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};
function UsersTable({ data }) {
  const { onPageChange, handleRowsPerPageChange } = useContext(TableContext);
  const customersIds = useCustomerIds(data.users);
  const customersSelection = useSelection(customersIds);

  return (
    <CustomersTable
      count={data.totalRows}
      items={data.users}
      onDeselectAll={customersSelection.handleDeselectAll}
      onDeselectOne={customersSelection.handleDeselectOne}
      onPageChange={onPageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onSelectAll={customersSelection.handleSelectAll}
      onSelectOne={customersSelection.handleSelectOne}
      page={+data.currentPage - 1}
      selected={customersSelection.selected}
      rowsPerPage={parseInt(data.rowsPerPage)}
      pageSizeOptions={[5, 10, 25, 30]}
    />
  );
}

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});
function CampaignsTable({ data }) {
  const { list } = data;
  const { onPageChange, handleRowsPerPageChange } = useContext(TableContext);

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>Campaign Name</TableCell>
                <TableCell>Screen Name</TableCell>
                <TableCell>Starts at</TableCell>
                <TableCell>Ends at</TableCell>
                <TableCell>Play Duration</TableCell>
                <TableCell sx={{ minWidth: 300 }}>Play Days</TableCell>
              </TableRow>
            </TableHead>
            {list.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={13}>
                    <Stack justifyContent="center" direction="row">
                      <Typography variant="h4">No Campaigns found</Typography>
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
                      <Typography variant="subtitle2">{campaign.screenName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.screenName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatter.format(new Date(`${campaign.startAt} ${campaign.playTimeAt}`))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatter.format(new Date(`${campaign.endAt} ${campaign.endTimeAt}`))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        {campaign.playDays.split(',').map((day) => (
                          <Chip key={day} label={day} sx={{ textTransform: 'capitalize' }} />
                        ))}
                      </Stack>
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
        count={+data.totalRows}
        onPageChange={onPageChange}
        page={+data.currentPage - 1}
        rowsPerPage={+data.rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 30]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}

const viewToComponentMap = {
  screens: ScreensTable,
  users: UsersTable,
  campaigns: CampaignsTable,
};
