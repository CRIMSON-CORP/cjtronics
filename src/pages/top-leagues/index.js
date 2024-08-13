import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { applyPagination } from 'src/utils/apply-pagination';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { Scrollbar } from 'src/components/scrollbar';
import handleGSSPError from 'src/utils/handle-gssp-error';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import { toast } from 'react-hot-toast';
import useTableFilter from 'src/hooks/useTableFilter';
import Filter from 'src/components/Filter';
import permissions from 'src/utils/permissions-config';
import useRoleProtect from 'src/hooks/useRole';
import usePermission from 'src/hooks/usePermission';
import useFetch from 'src/hooks/useFetch';

const useTopLeagues = (users, page) => {
  return useMemo(() => {
    return applyPagination(users, page);
  }, [users, page]);
};

const useTopLeaguesIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};

const Page = ({ top_leagues, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;
  const { push, replace, asPath } = useRouter();
  const leagues = useTopLeagues(top_leagues, page);
  const topLeaguesIds = useTopLeaguesIds(leagues);
  const topLeaguesSelection = useSelection(topLeaguesIds);

  const protectActionWrapper = useRoleProtect(permissions.create_top_league);
  const hasAddTopLeaguePermission = useRoleProtect(permissions.create_top_league);
  const hasDeleteToLeaguePermission = usePermission(permissions.remove_top_league);

  const [events = []] = useFetch('/get/events', 'events');

  const tableFilterParamsOPtions = useMemo(
    () => [
      {
        fieldKey: 'search',
        title: 'Search',
        type: 'string',
        value: '',
      },
      {
        fieldKey: 'filter[active]',
        title: 'Active Top Leagues',
        type: 'option',
        list: [
          { render: 'Active', value: true },
          { render: 'Inactive', value: false },
        ],
      },
      {
        fieldKey: 'filter[event]',
        title: 'Event',
        type: 'option',
        list: events.map((event) => ({ render: event.name, value: event._id })),
      },
    ],
    [events]
  );

  const { filterParams, setFilterParams, onPageChange } = useTableFilter(
    page + 1,
    tableFilterParamsOPtions
  );

  const goToAddTopLeague = useCallback(() => {
    push('/top-leagues/add');
  }, [push]);

  const handleRowsPerPageChange = useCallback(() => {}, []);

  const rowsPerPage = 25;

  const removeMultipleTopLeagues = useCallback(async () => {
    toast.promise(
      (async () => {
        await axios.post('/api/admin/top-leagues/remove-top-league', {
          id: JSON.stringify(topLeaguesSelection.selected),
        });
        replace(asPath);
      })(),
      {
        loading: 'Removing Top Leagues...',
        error: (error) => `Failed to remove Top Leagues: ${error.response.data.message}`,
        success: 'Top Leagues removed successfully',
      }
    );
  }, [asPath, replace, topLeaguesSelection.selected]);

  return (
    <>
      <Head>
        <title>Top Leagues | Dalukwa Admin</title>
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
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Top Leagues({total_results})</Typography>
              {hasAddTopLeaguePermission && (
                <div>
                  <Button
                    onClick={protectActionWrapper(goToAddTopLeague)}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Add
                  </Button>
                </div>
              )}
            </Stack>
            <Filter
              filterParams={filterParams}
              setFilterParams={setFilterParams}
              additionalElement={
                topLeaguesSelection.selected.length > 0 && hasDeleteToLeaguePermission ? (
                  <Button
                    color="error"
                    variant="contained"
                    onClick={removeMultipleTopLeagues}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <TrashIcon />
                      </SvgIcon>
                    }
                  >
                    Remove Selected
                  </Button>
                ) : (
                  <></>
                )
              }
            />
            <TopLeaguesTable
              count={total_results}
              items={top_leagues}
              onDeselectAll={topLeaguesSelection.handleDeselectAll}
              onDeselectOne={topLeaguesSelection.handleDeselectOne}
              onPageChange={onPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={topLeaguesSelection.handleSelectAll}
              onSelectOne={topLeaguesSelection.handleSelectOne}
              page={page}
              selected={topLeaguesSelection.selected}
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
    } = await axios.get(`/admin/top-league/list?${urlParams}`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

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
});

const TopLeaguesTable = (props) => {
  const {
    count = 0,
    items = [],
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onSelectAll,
    onSelectOne,
    page = 0,
    selected = [],
    rowsPerPage,
  } = props;

  const [topLeagueToRemoveId, setTopLeagueToRemoveId] = useState(null);

  const { replace, asPath } = useRouter();
  const protectActionWrapper = useRoleProtect(permissions.remove_top_league);
  const hasDeleteToLeaguePermission = usePermission(permissions.remove_top_league);

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const removeTopLeague = useCallback(
    (id) => async () => {
      toast.promise(
        (async () => {
          const response = await axios.post('/api/admin/top-leagues/remove-top-league', { id });
          if (response.data.success) {
            setTopLeagueToRemoveId(null);
            replace(asPath);
          } else throw response;
        })(),
        {
          loading: 'Removing Top League...',
          error: (error) => `Failed to remove top league!: ${error?.response?.data?.message}`,
          success: 'Top League removed successfully!',
        }
      );
    },
    [asPath, replace]
  );

  const _setTopLeagueToRemoveId = useCallback(
    (id) => () => {
      setTopLeagueToRemoveId(id);
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAll}
                      indeterminate={selectedSome}
                      onChange={(event) => {
                        if (event.target.checked) {
                          onSelectAll?.();
                        } else {
                          onDeselectAll?.();
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Active</TableCell>
                  {hasDeleteToLeaguePermission && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              {items.length === [] && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={13}>
                      <Stack justifyContent="center" direction="row">
                        <Typography variant="h4">No Top Leagues found</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}

              <TableBody>
                {items.map((league) => {
                  const isSelected = selected.includes(league._id);
                  const isActive =
                    new Date(league.data.start).getTime() < new Date().getTime() &&
                    new Date().getTime() < new Date(league.data.end).getTime();
                  return (
                    <TableRow hover key={league._id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(event) => {
                            event.stopPropagation();
                            if (event.target.checked) {
                              onSelectOne?.(league._id);
                            } else {
                              onDeselectOne?.(league._id);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{league.event.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{league.data.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{league.data.season}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatter.format(new Date(league.data.start))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatter.format(new Date(league.data.end))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={isActive} />
                      </TableCell>
                      {hasDeleteToLeaguePermission && (
                        <TableCell>
                          <Button
                            color="error"
                            onClick={_setTopLeagueToRemoveId(league._id)}
                            startIcon={
                              <SvgIcon>
                                <TrashIcon />
                              </SvgIcon>
                            }
                          >
                            Remove
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
        open={!!topLeagueToRemoveId}
        onClose={_setTopLeagueToRemoveId(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Remove Top League</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Remove this top League?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={_setTopLeagueToRemoveId(null)}>Cancel</Button>
          <Button onClick={protectActionWrapper(removeTopLeague(topLeagueToRemoveId))} autoFocus>
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
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
