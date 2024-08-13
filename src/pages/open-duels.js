import { useMemo } from 'react';
import Head from 'next/head';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
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
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import PropTypes from 'prop-types';
import { Scrollbar } from 'src/components/scrollbar';
import handleGSSPError from 'src/utils/handle-gssp-error';
import Filter from 'src/components/Filter';
import useTableFilter from 'src/hooks/useTableFilter';
import useFetch from 'src/hooks/useFetch';

const Page = ({ open_duels, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;

  const [events = []] = useFetch('/get/events', 'events');

  const tableFilterOptions = useMemo(
    () => [
      {
        fieldKey: 'filter[closed]',
        title: 'Closed',
        type: 'option',
        list: [true, false],
        value: '',
      },
      {
        fieldKey: 'filter[event]',
        title: 'Event',
        type: 'option',
        list: events.map((event) => ({ value: event._id, render: event.name })),
        value: '',
      },
    ],
    [events]
  );

  const { filterParams, setFilterParams, onPageChange } = useTableFilter(
    page + 1,
    tableFilterOptions
  );

  const rowsPerPage = 25;

  return (
    <>
      <Head>
        <title>Open Duels | Dalukwa Admin</title>
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
            <Typography variant="h4">Open Duels({total_results})</Typography>
            <Filter filterParams={filterParams} setFilterParams={setFilterParams} />
            <TopLeaguesTable
              count={total_results}
              items={open_duels}
              onPageChange={onPageChange}
              page={page}
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

  const fetchParams = {
    headers: {
      Authorization: `Bearer ${userAuthToken}`,
    },
  };

  try {
    const {
      data: { data },
    } = await axios.get(`/admin/open-duel/list?${urlParams}`, fetchParams);

    return {
      props: data,
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;

const formatter = Intl.DateTimeFormat('en-us', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const TopLeaguesTable = (props) => {
  const { count = 0, items = [], onPageChange = () => {}, page = 0, rowsPerPage } = props;

  return (
    <>
      <Card>
        <Scrollbar>
          <Box sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Fixture Date</TableCell>
                  <TableCell>Maker</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>League</TableCell>
                  <TableCell>Teams</TableCell>
                  <TableCell>Total Stake</TableCell>
                  <TableCell>Available Stake</TableCell>
                  <TableCell>Minimum Stake</TableCell>
                  <TableCell>Closed</TableCell>
                </TableRow>
              </TableHead>
              {items.length === 0 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={13}>
                      <Stack justifyContent="center" direction="row">
                        <Typography variant="h4">No Open Duels found</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}

              <TableBody>
                {items.map((fixture) => {
                  const closed = new Date(fixture.close_time).getTime() < new Date().getTime();
                  return (
                    <TableRow hover key={fixture._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatter.format(new Date(fixture.fixture.details.date))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.maker.username}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {fixture.fixture.details.status?.long}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {fixture.fixture.details.league.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Chip
                            avatar={<Avatar src={fixture.fixture.details.teams.home.logo} />}
                            label={fixture.fixture.details.teams.home.name}
                          />
                          <Typography variant="subtitle2">vs</Typography>
                          <Chip
                            avatar={<Avatar src={fixture.fixture.details.teams.away.logo} />}
                            label={fixture.fixture.details.teams.away.name}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.total_stake}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.available_stake}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.minimum_stake}</Typography>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={closed} />
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
          count={count}
          onPageChange={onPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]}
        />
      </Card>
    </>
  );
};

TopLeaguesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
