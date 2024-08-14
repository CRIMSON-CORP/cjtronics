import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import {
  Box,
  Button,
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
import Head from 'next/head';
import { useCallback, useMemo, useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OrganizationsTable } from 'src/sections/customer/organizations-table';
import { applyPagination } from 'src/utils/apply-pagination';

const useCustomers = (users, page) => {
  return useMemo(() => {
    return applyPagination(users, page);
  }, [users, page]);
};

const useCustomerIds = (customers) => {
  return useMemo(() => {
    return customers.map((customer) => customer.id);
  }, [customers]);
};

const Page = ({ users, total_results, pager_current_page }) => {
  const page = pager_current_page - 1;
  const customers = useCustomers(users, page);
  const customersIds = useCustomerIds(customers);
  const customersSelection = useSelection(customersIds);

  const handleRowsPerPageChange = useCallback(() => {}, []);

  const onPageChange = () => {};

  const rowsPerPage = Math.min(users.length, 25);

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
              <Typography variant="h5">Organizations({total_results})</Typography>
              <CreateOrganizationForm />
            </Stack>
            <OrganizationsTable
              count={total_results}
              items={users}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={onPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              selected={customersSelection.selected}
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

  // try {
  //   const {
  //     data: { data },
  //   } = await axios.get(`/admin/user/list?${urlParams}`, {
  //     headers: {
  //       Authorization: `Bearer ${userAuthToken}`,
  //     },
  //   });

  //   return {
  //     props: data,
  //   };
  // } catch (error) {
  //   console.log(error);
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {
      users: [
        {
          createdAt: '2023-07-11T21:14:46.284Z',
          name: 'Techbeaver',
          updatedAt: '2023-07-11T21:14:46.284Z',
        },
      ],
      total_results: 1,
      pager_current_page: 1,
    },
  };
});

export default Page;

function CreateOrganizationForm() {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
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
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            console.log(email);
            handleClose();
          },
        }}
      >
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We will send updates
            occasionally.
          </DialogContentText>
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
          <Button type="submit" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
