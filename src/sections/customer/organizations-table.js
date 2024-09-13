import {
  Campaign,
  Delete,
  DeleteForever,
  DeleteSweep,
  Edit,
  Monitor,
  MoreVert,
  People,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import { Scrollbar } from 'src/components/scrollbar';
import { usePopover } from 'src/hooks/use-popover';
import { getInitials } from 'src/utils/get-initials';

export const OrganizationsTable = (props) => {
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
  } = props;

  const { replace, asPath } = useRouter();

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const deleteSelectedOrganizations = (references) => async (e) => {
    try {
      await toast.promise(
        Promise.all([
          ...references.map((reference) =>
            axios.post('/api/admin/organizations/delete', {
              reference,
            })
          ),
        ]),
        {
          loading: 'Deleteing Organizations...',
          success: () => {
            replace(asPath);
            return 'Organizations deleted';
          },
          error: (error) => {
            console.log(error);
            return 'Failed to delete Organizations, Please try again';
          },
        }
      );
    } catch (error) {}
  };

  return (
    <Card>
      {selected.length > 0 && (
        <Stack direction="row" justifyContent="flex-end" p={1}>
          <ConfirmAction
            color="error"
            title="Delete Selected Organizations?"
            proceedText="Delete Organizations"
            buttonProps={{ startIcon: <DeleteSweep />, variant: 'text' }}
            action={deleteSelectedOrganizations(selected)}
            content="Are you sure you want to delete the selected Organizations?"
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
                <TableCell>Organiaztion</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Created By</TableCell>
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
              {items.map((organization) => {
                const isSelected = selected.includes(organization.reference);
                return (
                  <TableRow
                    hover
                    key={organization.reference}
                    selected={isSelected}
                    sx={{
                      bgcolor: organization.isActive ? '#7ae57a12' : '#e57a7a12',
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          if (event.target.checked) {
                            onSelectOne?.(organization.reference);
                          } else {
                            onDeselectOne?.(organization.reference);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={organization.avatar}>
                          {getInitials(`${organization.name}`)}
                        </Avatar>
                        <Typography variant="subtitle1">{organization.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {formatRelativeTime(new Date(organization.createdAt))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{organization.createdByName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={1}>
                        <Options name={organization.name} reference={organization.reference} />
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
      />
    </Card>
  );
};

OrganizationsTable.propTypes = {
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

function EditOrganizationForm({ reference, name }) {
  const { replace, asPath } = useRouter();
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddScreen(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('organization-name');
    if (!name) {
      return toast.error('organization name is required!');
    }

    setIsSubmitting(true);

    try {
      await toast.promise(axios.post('/api/admin/organizations/edit', { reference, name }), {
        loading: 'Updating Organization, Hold on...',
        success: (response) => {
          replace(asPath);
          handleClose();
          return response.data.message;
        },
        error: 'Failed to create Update, Please try again',
      });
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <MenuItem onClick={handleClickOpen}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Organization</ListItemText>
      </MenuItem>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleAddScreen,
        }}
      >
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit Organization</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="organization-name"
            label="Organization name"
            type="text"
            fullWidth
            defaultValue={name}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting && <CircularProgress size={16} sx={{ color: 'rgba(0,0,0,0.5)' }} />
            }
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function Options({ reference, name }) {
  const { anchorRef, handleClose, handleOpen, open } = usePopover();

  const { push } = useRouter();
  const deleteOrganization = (reference) => async (e) => {
    try {
      await toast.promise(
        axios.post('/api/admin/organizations/delete', {
          reference,
        }),
        {
          loading: 'Deleteing Organization...',
          success: (response) => {
            replace(asPath);
            return response.data.message;
          },
          error: 'Failed to delete Organization, Please try again',
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const goToScreens = () => push(`/users/organizations/${reference}/screens`);
  const goToUsers = () => push(`/users/organizations/${reference}/users`);
  const goToCampaigns = () => push(`/users/organizations/${reference}/campaigns`);
  return (
    <>
      <IconButton
        id="options-button"
        aria-controls={open ? 'options-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        ref={anchorRef}
      >
        <MoreVert />
      </IconButton>
      <Menu
        open={open}
        onClose={handleClose}
        id="options-button"
        anchorEl={anchorRef.current}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuList>
          <EditOrganizationForm name={name} reference={reference} />
          <ConfirmAction
            color="error"
            title="Delete Organization?"
            proceedText="Delete Organization"
            buttonProps={{ startIcon: <DeleteForever /> }}
            action={deleteOrganization(reference)}
            content="Are you sure you want to delete this Organization?"
            trigger={
              <MenuItem>
                <ListItemIcon>
                  <Delete fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Organization</ListItemText>
              </MenuItem>
            }
          />
          <MenuItem onClick={goToUsers}>
            <ListItemIcon>
              <People fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Users in Organization</ListItemText>
          </MenuItem>
          <MenuItem onClick={goToScreens}>
            <ListItemIcon>
              <Monitor fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Screens in Organization</ListItemText>
          </MenuItem>
          <MenuItem onClick={goToCampaigns}>
            <ListItemIcon>
              <Campaign fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Campaigns in Organization</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  );
}
