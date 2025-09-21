import { Close, DeleteSweep, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
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
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import { Scrollbar } from 'src/components/scrollbar';
import { getInitials } from 'src/utils/get-initials';
import * as Yup from 'yup';

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
    users,
  } = props;
  const { replace, asPath } = useRouter();

  const selectedSome = selected.length > 0 && selected.length < items.length;
  const selectedAll = items.length > 0 && selected.length === items.length;

  const toggleActivateCompany = (reference, status) => async () => {
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
  };

  const deleteCompany = (reference) => async () => {
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
  };

  const deleteSelectedCompanies = (references) => async () => {
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
                        <EditCompany company={company} users={users} />
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

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  padding: 2,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

function EditCompany({ company, users }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const openModal = () => {
    setEditModalOpen(true);
  };
  const closeModal = () => {
    setEditModalOpen(false);
  };
  return (
    <>
      <Button onClick={openModal} startIcon={<Edit />} variant="contained">
        Edit
      </Button>
      <Modal open={editModalOpen} onClose={closeModal}>
        <Box sx={modalStyles}>
          <EditCompanyForm
            screen={screen}
            closeModal={closeModal}
            company={company}
            users={users}
          />
        </Box>
      </Modal>
    </>
  );
}

function EditCompanyForm({ closeModal, company, users = [] }) {
  const { replace, asPath } = useRouter();
  const formik = useFormik({
    initialValues: {
      ...company,
      accountOfficer: company.officerReference,
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required('Company Name is required'),
      code: Yup.string().max(255).required('Company Code is required'),
      managerName: Yup.string().max(255).required('Ad account manager name is required'),
      managerPhone: Yup.string().max(255).required('Ad account manager phone number is required'),
      managerEmail: Yup.string()
        .email('Must be a valid email!')
        .max(255)
        .required('Ad account manager name is required'),
      accountOfficer: Yup.string().max(255).required('Ad account officer is required'),
    }),
    onSubmit: async (values, helpers) => {
      helpers.setSubmitting(true);
      try {
        await toast.promise(axios.post('/api/admin/companies/create', values), {
          loading: 'Updating Ad Company, hang on a sec...',
          success: (response) => {
            closeModal();
            replace(asPath);
            return response.data.message;
          },
          error: (error) => {
            return error.response?.data?.message || error.message;
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const filteredUser = useMemo(() => users.filter((user) => user.isActive), [users]);
  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" justifyContent="space-between" gap={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5">Edit Comany</Typography>
            </Stack>
            <IconButton onClick={closeModal}>
              <Close />
            </IconButton>
          </Stack>
        }
      />
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.name && formik.errors.name)}
                fullWidth
                helperText={formik.touched.name && formik.errors.name}
                label="Company Name"
                name="name"
                id="name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.name}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.code && formik.errors.code)}
                fullWidth
                helperText={formik.touched.code && formik.errors.code}
                label="Company Code"
                name="code"
                id="code"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.code}
              />
              <FormHelperText>This can be the company&apos;s abbreviation e.g ABBV</FormHelperText>
            </FormControl>
            <Divider />
            <Typography variant="subtitle1">Company Ad Account Manager</Typography>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.managerName && formik.errors.managerName)}
                fullWidth
                helperText={formik.touched.managerName && formik.errors.managerName}
                label="Ad Account Manager Name"
                name="managerName"
                id="managerName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="text"
                value={formik.values.managerName}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.managerEmail && formik.errors.managerEmail)}
                fullWidth
                helperText={formik.touched.managerEmail && formik.errors.managerEmail}
                label="Ad Account Manager Email"
                name="managerEmail"
                id="managerEmail"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.managerEmail}
              />
            </FormControl>
            <FormControl variant="outlined">
              <TextField
                error={!!(formik.touched.managerPhone && formik.errors.managerPhone)}
                fullWidth
                helperText={formik.touched.managerPhone && formik.errors.managerPhone}
                label="Ad Account Manager Phone number"
                name="managerPhone"
                id="managerPhone"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="tel"
                value={formik.values.managerPhone}
              />
            </FormControl>
            <Divider />
            <Typography variant="subtitle1">Account Officer</Typography>
            <FormControl variant="outlined">
              <InputLabel htmlFor="account_officer">Account Officer</InputLabel>
              <Select
                error={!!(formik.touched.accountOfficer && formik.errors.accountOfficer)}
                fullWidth
                label="Account Officer"
                name="accountOfficer"
                id="accountOfficer"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.accountOfficer}
              >
                {filteredUser.map((user) => (
                  <MenuItem key={user.id} value={user.reference}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
              {!!(formik.touched.accountOfficer && formik.errors.accountOfficer) && (
                <FormHelperText sx={{ color: 'error.main' }}>
                  {formik.errors.accountOfficer}
                </FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              startIcon={
                formik.isSubmitting && (
                  <CircularProgress size={16} sx={{ color: 'rgba(17,25,39,0.6)' }} />
                )
              }
              variant="contained"
              size="large"
              disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
            >
              Edit Company
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
