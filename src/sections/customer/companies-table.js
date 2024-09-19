import { DeleteSweep } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import { Scrollbar } from 'src/components/scrollbar';
import { getInitials } from 'src/utils/get-initials';

export const CompaniesTable = (props) => {
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
    pageSizeOptions,
    onRowsPerPageChange,
  } = props;
  const { replace, asPath } = useRouter();

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const toggleActivateCompany = (reference, status) => async (e) => {
    try {
      await toast.promise(
        axios.put('/api/admin/companies/update-status', {
          reference,
          status,
        }),
        {
          loading: `${status ? 'Activating' : 'Deactivating'} Company, Hang on a sec...`,
          success: (response) => {
            replace(asPath);
            return response.data.message;
          },
          error: (error) => {
            return error.response?.data?.message || error.response?.data || error.message;
          },
        }
      );
    } catch (error) {}
  };

  const deleteCompany = (reference) => async (e) => {
    try {
      await toast.promise(
        axios.put('/api/admin/companies/delete', {
          reference,
        }),
        {
          loading: 'Deleting Company, Hang on a sec...',
          success: (response) => {
            replace(asPath);
            return response.data.message;
          },
          error: (error) => error.response?.data?.message || error.response?.data || error.message,
        }
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteSelectedCompanies = (references) => async (e) => {
    try {
      await toast.promise(
        Promise.all([
          ...references.map((reference) =>
            axios.post('/api/admin/companies/delete', {
              reference,
            })
          ),
        ]),
        {
          loading: 'Deleteing Companies...',
          success: () => {
            replace(asPath);
            return 'Companies deleted';
          },
          error: (error) => error.response?.data?.message || error.response?.data || error.message,
        }
      );
    } catch (error) {
      throw error;
    }
  };

  return (
    <Card>
      {selected.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" p={1}>
          <ConfirmAction
            color="error"
            title="Delete Selected Companies?"
            proceedText="Delete Companies"
            buttonProps={{ startIcon: <DeleteSweep />, variant: 'text' }}
            action={deleteSelectedCompanies(selected)}
            content="Are you sure you want to delete the selected Companies?"
          >
            Delete Selected
          </ConfirmAction>
        </Stack>
      )}
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
                <TableCell>Company</TableCell>
                <TableCell>Ad Account Officer</TableCell>
                <TableCell>Ad Account Manager</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {items.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={13}>
                    <Stack justifyContent="center" direction="row">
                      <Typography variant="h6">No Companies found</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}

            <TableBody>
              {items.map((company) => {
                const isSelected = selected.includes(company.reference);
                return (
                  <TableRow
                    hover
                    key={company.id}
                    selected={isSelected}
                    sx={{
                      bgcolor: company.isActive ? '#7ae57a12' : '#e57a7a12',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          if (event.target.checked) {
                            onSelectOne?.(company.reference);
                          } else {
                            onDeselectOne?.(company.reference);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {company.name} ({company.code})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{company.officerName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={company.avatar}>
                          {getInitials(`${company.managerName}`)}
                        </Avatar>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Typography variant="subtitle1">{company.managerName}</Typography>
                          <Typography variant="subtitle2">{company.managerEmail}</Typography>
                          <Chip label={company.managerPhone} sx={{ textTransform: 'capitalize' }} />
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatDistanceToNow(new Date(company.createdAt))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        <ConfirmAction
                          title={company.isActive ? 'Deactivate Company?' : 'Activate Company?'}
                          color={company.isActive ? 'error' : undefined}
                          action={toggleActivateCompany(company.reference, !company.isActive)}
                          content={`Are you sure you want to ${
                            company.isActive ? 'Deactivate' : 'Activate'
                          } this Company?`}
                        >
                          {company.isActive ? 'Deactivate' : 'Activate'}
                        </ConfirmAction>
                        <ConfirmAction
                          title="Delete Company?"
                          color="error"
                          action={deleteCompany(company.reference)}
                          content="Are you sure you want to delete this Company?"
                        >
                          Delete
                        </ConfirmAction>
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
        count={count}
        onPageChange={onPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={pageSizeOptions}
      />
    </Card>
  );
};

CompaniesTable.propTypes = {
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
