import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getAllOrganizations } from 'src/lib/actions';
import { OrganizationsTable } from 'src/sections/customer/organizations-table';

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.reference);
  }, [customers]);
};

const Page = ({ organizations }) => {
  const page = organizations.currentPage - 1;

  const customersIds = useCustomerIds(organizations.list);
  const customersSelection = useSelection(customersIds);

  const handleRowsPerPageChange = useCallback((event) => {
    replace(`/users?size=${event.target.value}&${query.page ? `page=${query.page}` : ''}`);
  }, []);

  const onPageChange = (_event, newPage) => {
    replace(`/users?page=${newPage + 1}&${query.size ? `size=${query.size}` : ''}`);
  };

  return (
    <>
      <Head>
        <title>Organizations | Dalukwa Admin</title>
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
            <Stack flexWrap="wrap" gap={3} direction="row" justifyContent="space-between">
              <Typography variant="h5">Organizations({organizations.totalRows})</Typography>
              <CreateOrganizationForm />
            </Stack>
            <OrganizationsTable
              page={page}
              onPageChange={onPageChange}
              items={organizations.list}
              count={organizations.totalRows}
              pageSizeOptions={[5, 10, 25, 30]}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              selected={customersSelection.selected}
              rowsPerPage={+organizations.rowsPerPage}
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
    size: ctx.query.size || 25,
  };

  try {
    const organizations = await getAllOrganizations(ctx.req, params);
    return {
      props: { organizations },
    };
  } catch (error) {
    console.log(error);

    if (error?.response?.status === 401) {
      return {
        redirect: {
          destination: '/auth/login?auth=false',
          permanent: false,
        },
      };
    }

    return {
      notFound: true,
    };
  }

  // return {
  //   props: {
  //     users: [
  //       {
  //         createdAt: '2024-08-07T23:10:31.980Z',
  //         email: 'aa@aa.com',
  //         firstName: 'aa',
  //         lastName: 'aa',
  //         organizationId: '64ae8231564cd6a76b7b2a42',
  //         privilege: 'user',
  //         type: 'individual',
  //         updatedAt: '2024-08-07T23:10:31.980Z',
  //         userActiveStatus: 1,
  //         username: 'aa.aa',
  //       },
  //     ],
  //     total_results: 1,
  //     pager_current_page: 1,
  //   },
  // };
});

export default Page;

function CreateOrganizationForm() {
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
      await toast.promise(axios.post('/api/admin/organizations/create', { name }), {
        loading: 'Creating Organization, Hold on...',
        success: (response) => {
          replace(asPath);
          handleClose();
          return response.data.message;
        },
        error: 'Failed to create Organization, Please try again',
      });
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <>
      <Button onClick={handleClickOpen} startIcon={<AddBusinessIcon />} variant="contained">
        Create Organization
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleAddScreen,
        }}
      >
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>Create new organization</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="organization-name"
            label="Organization name"
            type="text"
            fullWidth
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
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
