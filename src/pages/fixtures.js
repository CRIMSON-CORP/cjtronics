import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
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
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Scrollbar } from 'src/components/scrollbar';
import handleGSSPError from 'src/utils/handle-gssp-error';
import Filter from 'src/components/Filter';
import useTableFilter from 'src/hooks/useTableFilter';
import useFetch from 'src/hooks/useFetch';
import usePermission from 'src/hooks/usePermission';
import permissions from 'src/utils/permissions-config';
import { toast } from 'react-hot-toast';

const Page = ({ fixtures, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;

  const [events = []] = useFetch('/get/events', 'events');

  const tableFilterOptions = useMemo(
    () => [
      {
        fieldKey: 'search',
        title: 'Search',
        type: 'string',
        value: '',
      },
      {
        fieldKey: 'filter[event]',
        title: 'Event',
        type: 'option',
        list: events.map((event) => ({ value: event._id, render: event.name })),
        value: '',
      },
      {
        fieldKey: 'filter[status]',
        title: 'Status',
        type: 'option',
        list: ['pending', 'completed', 'cancelled', 'postponed'],
        value: '',
      },
      {
        fieldKey: 'filter[needs_manual_review]',
        title: 'Needs Manual Review',
        type: 'option',
        list: [true, false],
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
        <title>Fixtures | Dalukwa Admin</title>
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
            <Typography variant="h4">Fixtures({total_results})</Typography>
            <Filter filterParams={filterParams} setFilterParams={setFilterParams} />
            <TopLeaguesTable
              count={total_results}
              items={fixtures}
              onPageChange={onPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              events={events}
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
    } = await axios.get(`/admin/fixture/list?${urlParams}`, fetchParams);

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
  const { count = 0, items = [], onPageChange = () => {}, page = 0, rowsPerPage, events } = props;
  const [selectedFixture, setSelectedFixture] = useState(null);

  const selectedFixtureEvent = useMemo(
    () => events.find((event) => event?._id === selectedFixture?.event._id) ?? undefined,
    [events, selectedFixture]
  );

  const hasUpdateFixturePermission = usePermission(permissions.update_fixture);

  const toggleSelectedFixtureData = useCallback(
    (data) => () => {
      setSelectedFixture(data);
    },
    []
  );

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
                  <TableCell>Status</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>League</TableCell>
                  <TableCell>Teams</TableCell>
                  <TableCell>Total Open Duels</TableCell>
                  <TableCell>Total Locked Duels</TableCell>
                  <TableCell>Duel Status</TableCell>
                  <TableCell>Needs Manual Review</TableCell>
                  {hasUpdateFixturePermission && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              {items.length === 0 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={13}>
                      <Stack justifyContent="center" direction="row">
                        <Typography variant="h4">No Fixtures found</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}

              <TableBody>
                {items.map((fixture) => {
                  return (
                    <TableRow hover key={fixture._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatter.format(new Date(fixture.details.date))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.details.status.long}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.details.country?.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.details.league.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={3} direction="row">
                          <Chip
                            avatar={<Avatar src={fixture.details.teams.home.logo} />}
                            label={fixture.details.teams.home.name}
                          />
                          <Typography variant="subtitle2">vs</Typography>
                          <Chip
                            avatar={<Avatar src={fixture.details.teams.away.logo} />}
                            label={fixture.details.teams.away.name}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.total_open_duels}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.total_locked_duels}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{fixture.status}</Typography>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={fixture.needs_manual_review} />
                      </TableCell>
                      {hasUpdateFixturePermission && fixture.needs_manual_review && (
                        <TableCell>
                          <Button variant="contained" onClick={toggleSelectedFixtureData(fixture)}>
                            Update
                          </Button>
                        </TableCell>
                      )}
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
      <Dialog
        open={!!selectedFixture}
        onClose={toggleSelectedFixtureData(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <UpdateFixtureDialogueContent
          selectedFixture={selectedFixture}
          selectedFixtureEvent={selectedFixtureEvent}
          onClose={toggleSelectedFixtureData(null)}
        />
      </Dialog>
    </>
  );
};

function UpdateFixtureDialogueContent({ selectedFixtureEvent, selectedFixture, onClose }) {
  const [results, setResults] = useState(selectedFixture);
  const { replace, asPath } = useRouter();

  const updateFixture = useCallback(() => {
    if (Object.values(results).some((value) => value === '')) {
      return toast.error('Please fill all results!');
    }
    toast.promise(
      (async () => {
        await axios.post('/api/admin/fixtures/update', {
          id: selectedFixture._id,
          results,
        });
        onClose();
        replace(asPath);
      })(),
      {
        loading: 'Updating Fixture result...',
        error: (error) => `Failed to Update Fixture Result: ${error.response.data.message}`,
        success: 'Fixture updated successfully',
      }
    );
  }, [asPath, onClose, replace, results, selectedFixture?._id]);

  useEffect(() => {
    if (selectedFixtureEvent !== undefined) {
      setResults(
        Object.assign(
          {},
          ...selectedFixtureEvent.prediction_base_list.map((base) => ({ [base._id]: '' })),
          selectedFixture?.results ?? {}
        )
      );
    }
  }, [selectedFixture?.results, selectedFixtureEvent]);

  const chooseOption = useCallback(
    (base, prediction) => () => {
      setResults((prev) => {
        return {
          ...prev,
          [base]: prev[base] === '' ? prediction : '',
        };
      });
    },
    []
  );

  return (
    <>
      <DialogTitle id="alert-dialog-title">Update Fixture</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {selectedFixtureEvent?.prediction_base_list?.map(({ _id, name }) => (
            <Paper key={_id} sx={{ padding: 1 }}>
              <Stack spacing={2}>
                <DialogContentText>{name}</DialogContentText>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  {selectedFixtureEvent?.prediction_list?.map((item) => (
                    <Button
                      key={item}
                      variant={results[_id] === item ? 'contained' : 'outlined'}
                      onClick={chooseOption(_id, item)}
                    >
                      {item}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={updateFixture} autoFocus>
          Update
        </Button>
      </DialogActions>
    </>
  );
}

TopLeaguesTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
};
