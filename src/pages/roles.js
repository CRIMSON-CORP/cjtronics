import Head from 'next/head';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import PencilSquareIcon from '@heroicons/react/24/solid/PencilSquareIcon';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import axios from 'src/lib/axios';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { memo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import role_permissions from 'src/utils/permissions-config';
import useRoleProtect from 'src/hooks/useRole';
import { toast } from 'react-hot-toast';
import handleGSSPError from 'src/utils/handle-gssp-error';
import usePermission from 'src/hooks/usePermission';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import useToggle from 'src/hooks/useToggle';

const Page = ({ roles, permissions }) => {
  return (
    <>
      <Head>
        <title>Roles | Dalukwa Admin</title>
      </Head>
      <Box flexGrow={1} py={8} component="main">
        <Stack spacing={6}>
          <Roles roles={roles} permissions={permissions} />
          <Permissions permissions={permissions} />
        </Stack>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  try {
    const rolesFetch = axios.get(`/admin/role/list`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    const permissionsFetch = axios.get(`/admin/role/permissions`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    const [
      {
        data: {
          data: { roles },
        },
      },
      {
        data: {
          data: { permissions },
        },
      },
    ] = await Promise.all([rolesFetch, permissionsFetch]);

    return {
      props: {
        roles,
        permissions,
      },
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;

function Roles({ roles, permissions }) {
  const hasAddRolePermission = usePermission(role_permissions.create_role);

  return (
    <>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h4">Roles</Typography>
              {hasAddRolePermission && <AddRole permissions={permissions} />}
            </Stack>
          </Stack>
          <Stack spacing={3}>
            {roles.map((role) => (
              <Role key={role._id} role={role} permissions={permissions} />
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

function Role({ role, permissions }) {
  const hasEditRolePermission = usePermission(role_permissions.update_role);

  return (
    <>
      <Accordion p={3} sx={{ width: 'fit-content' }}>
        <AccordionSummary
          expandIcon={
            <SvgIcon>
              <ChevronDownIcon />
            </SvgIcon>
          }
          id={role._id}
          aria-controls="panel1a-content"
        >
          <Stack
            mr={2}
            spacing={2}
            width="100%"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">{role.name}</Typography>
            <DeleteRole id={role._id} name={role.name} />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {permissions.map((permission) => (
              <Permisision
                key={permission._id}
                name={permission.name}
                checked={role.meta.includes(permission.name)}
              />
            ))}
          </Grid>
        </AccordionDetails>
        <AccordionActions>
          {hasEditRolePermission && <EditRole role={role} permissions={permissions} />}
        </AccordionActions>
      </Accordion>
    </>
  );
}

function Permissions({ permissions }) {
  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Typography variant="h4">Permissions</Typography>
          </Stack>
        </Stack>
        <Card p={3}>
          <Box p={3}>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {permissions.map(({ name }) => (
                <Grid item key={name}>
                  <Paper>
                    <Box p={2}>
                      <Typography key={name}>{name}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
              <Grid item>
                <AddPermission />
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}

const Permisision = memo(({ name, checked, onChange }) => {
  const handleOnChange = useCallback(() => {
    onChange && onChange(name);
  }, [name, onChange]);
  return (
    <Grid item>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Checkbox checked={checked} onChange={handleOnChange} />
        <Typography variant="body1">{name}</Typography>
      </Stack>
    </Grid>
  );
});

function AddRole({ permissions }) {
  const [name, setName] = useState('');
  const [meta, setMeta] = useState([]);

  const { state, open, close } = useToggle();

  const protectActionWrapper = useRoleProtect(role_permissions.create_role);

  const router = useRouter();

  const handleNameChange = useCallback((e) => {
    setName(e.target.value.toUpperCase());
  }, []);

  const toggleMeta = useCallback((value) => {
    setMeta((prev) => {
      if (prev.includes(value)) {
        return prev.filter((_meta) => _meta !== value);
      } else {
        return [...prev, value];
      }
    });
  }, []);

  const addRole = useCallback(() => {
    toast.promise(
      (async () => {
        await axios.post('/api/admin/roles/add-role', {
          name,
          permissions: meta,
        });
        close();
        router.replace(router.asPath);
      })(),
      {
        loading: 'Adding Role...',
        error: (error) => `Failed to Add Role: ${error.response.data.message}`,
        success: 'Role Added',
      }
    );
  }, [close, meta, name, router]);

  useEffect(() => {
    if (!state) {
      setName('');
      setMeta([]);
    }
  }, [state]);

  return (
    <>
      <Button
        onClick={protectActionWrapper(open)}
        startIcon={
          <SvgIcon fontSize="small">
            <PlusIcon />
          </SvgIcon>
        }
        variant="contained"
      >
        Add Role
      </Button>
      <Dialog
        open={state}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="Add a role"
      >
        <DialogTitle id="alert-dialog-title">Add a Role</DialogTitle>
        <DialogContent>
          <Stack p={3} spacing={3}>
            <TextField
              label="Role name"
              onChange={handleNameChange}
              color="primary"
              value={name}
              sx={{ textTransform: 'uppercase' }}
            />
            <Card>
              <CardHeader title="Add Permissions" />
              <CardContent>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                  {permissions.map((permission) => (
                    <Permisision
                      key={permission._id}
                      name={permission.name}
                      onChange={toggleMeta}
                      checked={meta.includes(permission.name)}
                    />
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={addRole} variant="contained">
            Add Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function EditRole({ role, permissions }) {
  const [name, setName] = useState(role.name);
  const [meta, setMeta] = useState(role.meta);

  const { state, open, close } = useToggle();

  const protectActionWrapper = useRoleProtect(role_permissions.update_role);

  const router = useRouter();

  const handleNameChange = useCallback((e) => {
    setName(e.target.value.toUpperCase());
  }, []);

  const toggleMeta = useCallback((value) => {
    setMeta((prev) => {
      if (prev.includes(value)) {
        return prev.filter((_meta) => _meta !== value);
      } else {
        return [...prev, value];
      }
    });
  }, []);

  const updateRole = useCallback(async () => {
    toast.promise(
      (async () => {
        await axios.post('/api/admin/roles/update-role', {
          roleId: role._id,
          name,
          permissions: meta,
        });
        close();
        router.replace(router.asPath);
      })(),
      {
        loading: 'Updating Role...',
        error: (error) => `Failed to Update Role: ${error?.response?.data?.message}`,
        success: 'Role updated successfully!',
      }
    );
  }, [close, meta, name, role._id, router]);

  useEffect(() => {
    if (!state) {
      setName(role.name);
      setMeta(role.meta);
    }
  }, [state, role.name, role.meta]);

  return (
    <>
      <Button
        onClick={protectActionWrapper(open)}
        startIcon={
          <SvgIcon fontSize="small">
            <PencilSquareIcon />
          </SvgIcon>
        }
        variant="contained"
      >
        Edit Role
      </Button>
      <Dialog
        open={state}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="Edit Role"
      >
        <DialogTitle id="alert-dialog-title">Edit Role</DialogTitle>
        <DialogContent>
          <Stack p={3} spacing={3}>
            <TextField
              label="Role name"
              onChange={handleNameChange}
              color="primary"
              value={name}
              sx={{ textTransform: 'uppercase' }}
            />
            <Card>
              <CardHeader title="Add Permissions" />
              <CardContent>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                  {permissions.map((permission) => (
                    <Permisision
                      key={permission._id}
                      name={permission.name}
                      onChange={toggleMeta}
                      checked={meta.includes(permission.name)}
                    />
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={updateRole} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function DeleteRole({ id, name }) {
  const { replace, asPath } = useRouter();

  const { state, open, close } = useToggle();

  const deleteRole = useCallback(() => {
    toast.promise(
      (async () => {
        await axios.post('/api/admin/roles/delete-role', { id });
        replace(asPath);
      })(),
      {
        loading: 'Deleting Role...',
        error: (error) => `Failed to delete Role: ${error?.response?.data?.message}`,
        success: 'Role Deleted Successfully',
      }
    );
  }, [asPath, replace, id]);

  return (
    <>
      <Button variant="contained" color="error" onClick={open}>
        <SvgIcon>
          <TrashIcon />
        </SvgIcon>
      </Button>
      <Dialog
        open={state}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete this Role?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{name}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={deleteRole} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function AddPermission() {
  const router = useRouter();
  const [permissionName, setPermissionName] = useState('');

  const { state, open, close } = useToggle();

  const onPermissionNameChange = useCallback((e) => {
    setPermissionName(e.target.value.toLowerCase().replaceAll(' ', '_'));
  }, []);

  const protectActionWrapper = useRoleProtect(role_permissions.create_role);
  const hasAddPermissionPermission = usePermission(role_permissions.create_role_permission);

  const addPermission = useCallback(async () => {
    toast.promise(
      (async () => {
        const response = await axios.post('/api/admin/roles/add-permission', {
          name: permissionName,
        });
        if (response.data.success) {
          router.replace(router.asPath);
        }
      })(),
      {
        loading: 'Adding Permission...',
        error: (error) => `Failed to add permission: ${error.response.data.message}`,
        success: 'Permission Added!',
      }
    );
  }, [permissionName, router]);

  return (
    <>
      {hasAddPermissionPermission && (
        <Button
          onClick={protectActionWrapper(open)}
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          variant="contained"
        >
          Add permission
        </Button>
      )}
      <Dialog
        open={state}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Add new permission</DialogTitle>
        <DialogContent>
          <TextField
            variant="filled"
            label="Permission name"
            value={permissionName}
            onChange={onPermissionNameChange}
          />
          <DialogContentText id="alert-dialog-description">{name}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={addPermission} variant="contained">
            Add Permission
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
