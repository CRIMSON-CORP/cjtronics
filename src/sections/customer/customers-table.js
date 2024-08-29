import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import { Scrollbar } from 'src/components/scrollbar';
import { useAuth } from 'src/hooks/use-auth';
import { getInitials } from 'src/utils/get-initials';

export const CustomersTable = (props) => {
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

  const toggleAdminUser = (reference, set) => async (e) => {
    try {
      const { data } = await axios.post(`/api/admin/users/${set ? 'set-admin' : 'remove-admin'}`, {
        reference,
      });
      toast.success(data.message);
      replace(asPath);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    }
  };

  const toggleSuspendUser = (reference, suspend) => async (e) => {
    try {
      const { data } = await axios.post(`/api/admin/users/${suspend ? 'disable' : 'enable'}`, {
        reference,
      });
      toast.success(data.message);
      replace(asPath);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    }
  };

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
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
                <TableCell>User</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {items.length === 0 && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={13}>
                    <Stack justifyContent="center" direction="row">
                      <Typography variant="h4">No Users found</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}

            <TableBody>
              {items.map((user) => {
                const isSelected = selected.includes(user.id);
                return (
                  <TableRow
                    hover
                    key={user.id}
                    selected={isSelected}
                    sx={{
                      bgcolor: user.isActive ? '#7ae57a12' : '#e57a7a12',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          if (event.target.checked) {
                            onSelectOne?.(user.id);
                          } else {
                            onDeselectOne?.(user.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={user.avatar}>
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </Avatar>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="subtitle2">{user.email}</Typography>
                        </Stack>
                        <Chip label={user.userType} sx={{ textTransform: 'capitalize' }} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{user.reference}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatDistanceToNow(new Date(user.createdAt))} ago
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        {user.isActive ? (
                          <ConfirmAction
                            title="Suspend User?"
                            color="error"
                            action={toggleSuspendUser(user.reference, true)}
                            content="Are you sure you want to Suspend this User?"
                          >
                            Suspend
                          </ConfirmAction>
                        ) : (
                          <ConfirmAction
                            title="Unsuspend User?"
                            action={toggleSuspendUser(user.reference, false)}
                            content="Are you sure you want to Unsuspend this User?"
                          >
                            Unsuspend
                          </ConfirmAction>
                        )}
                        {user.userType !== 'admin' &&
                          (user.userType == 'partner' ? (
                            <ConfirmAction
                              color="error"
                              title="Remove User as partner?"
                              action={toggleAdminUser(user.reference, false)}
                              content="Are you sure you want to remove this User as a Partner?"
                            >
                              Remove as Partner
                            </ConfirmAction>
                          ) : (
                            <ConfirmAction
                              color="info"
                              title="Remove User as partner?"
                              action={toggleAdminUser(user.reference, true)}
                              content="Are you sure you want to remove this User as a Partner?"
                            >
                              Activate as Partner
                            </ConfirmAction>
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
        count={count}
        onPageChange={onPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={pageSizeOptions}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Card>
  );
};

CustomersTable.propTypes = {
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
