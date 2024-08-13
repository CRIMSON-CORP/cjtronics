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
import useTableFilter from 'src/hooks/useTableFilter';
import FilterOptionsList from 'src/components/FilterOptionList';
import useFetch from 'src/hooks/useFetch';

const Page = ({ locked_duels, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;

  const [events = []] = useFetch('/get/events', 'events');

  const tableFilterOptions = useMemo(
    () => [
      {
        fieldKey: 'filter[settled]',
        title: 'Settled',
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
        <title>Locked Duels | Dalukwa Admin</title>
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
            <Typography variant="h4">Locked Duels({total_results})</Typography>
            <Filter filterParams={filterParams} setFilterParams={setFilterParams} />
            <LockedDuelsTable
              count={total_results}
              items={locked_duels}
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
    } = await axios.get(`/admin/locked-duel/list?${urlParams}`, fetchParams);

    return {
      props: data,
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;

function Filter({ filterParams, setFilterParams }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="flex-start" spacing={2}>
        {filterParams.map((filter) => (
          <FilterOptionsList key={filter.fieldKey} {...filter} setFilterParams={setFilterParams} />
        ))}
      </Stack>
    </Card>
  );
}

const formatter = Intl.DateTimeFormat('en-us', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const LockedDuelsTable = (props) => {
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
                  <TableCell>Ficture date</TableCell>
                  <TableCell>Maker</TableCell>
                  <TableCell>Taker</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>League</TableCell>
                  <TableCell>Teams</TableCell>
                  <TableCell>Total Open Duels</TableCell>
                  <TableCell>Total Locked Duels</TableCell>
                  <TableCell>Duels Status</TableCell>
                  <TableCell>Needs Manual Review</TableCell>
                  <TableCell>Stake</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Potential Winning</TableCell>
                  <TableCell>Settled</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Closed</TableCell>
                </TableRow>
              </TableHead>
              {items.length === 0 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={13}>
                      <Stack justifyContent="center" direction="row">
                        <Typography variant="h4">No Locked Duels found</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}

              <TableBody>
                {items.map((locaked_duel) => {
                  const closed = new Date(locaked_duel.close_time).getTime() < new Date().getTime();
                  const winner =
                    locaked_duel.winner === locaked_duel.maker._id
                      ? 'maker'
                      : locaked_duel.winner === locaked_duel.taker._id
                      ? 'taker'
                      : null;
                  console.log(locaked_duel);
                  return (
                    <TableRow hover key={locaked_duel._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{locaked_duel.event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatter.format(new Date(locaked_duel.fixture.details.date))}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: winner === 'maker' ? '#52dd5226' : '' }}>
                        <Typography variant="subtitle2">
                          {locaked_duel.maker.username}({locaked_duel.predictions.maker})
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ backgroundColor: winner === 'taker' ? '#52dd5226' : '' }}>
                        <Typography variant="subtitle2">
                          {locaked_duel.taker.username}({locaked_duel.predictions.taker})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {locaked_duel.fixture.details.status.long}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {locaked_duel.fixture.details.league.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Chip
                            avatar={<Avatar src={locaked_duel.fixture.details.teams.home.logo} />}
                            label={locaked_duel.fixture.details.teams.home.name}
                          />
                          <Typography variant="subtitle2">vs</Typography>
                          <Chip
                            avatar={<Avatar src={locaked_duel.fixture.details.teams.away.logo} />}
                            label={locaked_duel.fixture.details.teams.away.name}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {locaked_duel.fixture.total_open_duels}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {locaked_duel.fixture.total_locked_duels}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{locaked_duel.fixture.status}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          <Checkbox checked={locaked_duel.fixture.needs_manual_review} />
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{locaked_duel.stake}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{locaked_duel.fee}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {locaked_duel.potential_winning}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          <Checkbox checked={locaked_duel.settled} />
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{locaked_duel.result}</Typography>
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

LockedDuelsTable.propTypes = {
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
