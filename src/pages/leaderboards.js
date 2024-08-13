import Head from 'next/head';
import { useMemo } from 'react';
import {
  Box,
  Card,
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

const Page = ({ leader_boards, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;

  const tableFilterOptions = useMemo(
    () => [
      {
        fieldKey: 'filter[week]',
        title: 'Week',
        type: 'option',
        list: Array.from(Array(52).keys()).map((_, index) => index + 1),
        value: '',
      },
      {
        fieldKey: 'filter[year]',
        title: 'Year',
        type: 'option',
        list: Array.from(Array(new Date().getFullYear() - 2023 + 1).keys()).map(
          (_, index) => index + 2023
        ),
        value: '',
      },
    ],
    []
  );

  const { filterParams, setFilterParams, onPageChange } = useTableFilter(
    page + 1,
    tableFilterOptions
  );

  const rowsPerPage = 25;

  return (
    <>
      <Head>
        <title>Leaderboards | Dalukwa Admin</title>
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
              <Typography variant="h4">Leaderbaords({total_results})</Typography>
            </Stack>
            <Filter filterParams={filterParams} setFilterParams={setFilterParams} />
            <LeaderboardsTable
              count={total_results}
              items={leader_boards}
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

  try {
    const {
      data: { data },
    } = await axios.get(`/admin/leaderboard/list?${urlParams}`, {
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

const LeaderboardsTable = (props) => {
  const { count = 0, items = [], onPageChange = () => {}, page = 0, rowsPerPage } = props;

  return (
    <>
      <Card>
        <Scrollbar>
          <Box sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Week</TableCell>
                  <TableCell>Year</TableCell>
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
                {items.map((leaderboard) => {
                  return (
                    <TableRow hover key={leaderboard._id}>
                      <TableCell>
                        <Typography variant="subtitle2">{leaderboard.user.username}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{leaderboard.user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{leaderboard.point}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{leaderboard.week}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{leaderboard.year}</Typography>
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

LeaderboardsTable.propTypes = {
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
