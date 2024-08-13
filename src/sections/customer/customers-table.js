import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { getInitials } from 'src/utils/get-initials';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  } = props;

  const { push } = useRouter();

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const goToUserDetails = useCallback(
    (id) => () => {
      push(`/users/${id}`);
    },
    [push]
  );

  return (
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
                <TableCell>Avatar</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>LastName</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Age Bracket</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Blocked</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Last IP</TableCell>
                <TableCell>Reg IP</TableCell>
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
                const isSelected = selected.includes(user._id);
                return (
                  <TableRow
                    hover
                    key={user._id}
                    selected={isSelected}
                    onClick={goToUserDetails(user._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          if (event.target.checked) {
                            onSelectOne?.(user._id);
                          } else {
                            onDeselectOne?.(user._id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar src={user.avatar}>
                        {getInitials(`${user.firstname} ${user.lastname}`)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{user.firstname}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{user.lastname}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{user.username}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.age_bracket}</TableCell>
                    <TableCell>{user.role.name}</TableCell>
                    <TableCell>
                      <Checkbox checked={user.blocked} />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={user.active} />
                    </TableCell>
                    <TableCell>{user.last_ip}</TableCell>
                    <TableCell>{user.reg_ip}</TableCell>
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
