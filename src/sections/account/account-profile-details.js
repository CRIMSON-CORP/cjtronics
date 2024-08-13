import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Unstable_Grid2 as Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'src/lib/axios';
import { useRouter } from 'next/router';

export const AccountProfileDetails = ({ user, roles, ageBracket }) => {
  const [values, setValues] = useState(user);

  const handleChange = useCallback((event) => {
    setValues((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }, []);

  const { push } = useRouter();

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      toast.promise(
        (async () => {
          await axios.post('/api/admin/user/update', {
            id: values._id,
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            phone: values.phone,
            username: values.username,
            role_id: values.role._id,
            age_bracket: values.age_bracket,
          });
          push('/users');
        })(),
        {
          loading: 'Updating user...',
          error: (error) => {
            console.log(error);
            return `Failed to update user: ${error.response.data.message}`;
          },
          success: 'User updated!',
        }
      );
    },
    [push, values]
  );

  const updateRole = useCallback(
    (event) => {
      setValues((prevState) => ({
        ...prevState,
        role: roles.find((role) => role._id === event.target.value),
      }));
    },
    [roles]
  );

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="The information can be updated" title="Profile" />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ m: -1.5 }}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  helperText="Please specify the first name"
                  label="First name"
                  name="firstname"
                  onChange={handleChange}
                  required
                  color="primary"
                  value={values.firstname}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last name"
                  name="lastname"
                  onChange={handleChange}
                  required
                  value={values.lastname}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  onChange={handleChange}
                  required
                  value={values.email}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  onChange={handleChange}
                  type="number"
                  value={values.phone}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  onChange={handleChange}
                  required
                  value={values.username}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="role-select">Role</InputLabel>
                  <Select
                    labelId="role-select"
                    value={values.role._id}
                    name="role"
                    label="Role"
                    onChange={updateRole}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role._id} value={role._id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="role-select">Age Bracket</InputLabel>
                  <Select
                    labelId="age-bracket-select"
                    value={values.age_bracket}
                    name="age_bracket"
                    label="Age Bracket"
                    onChange={handleChange}
                  >
                    {ageBracket.map((age_bracket) => (
                      <MenuItem key={age_bracket} value={age_bracket}>
                        {age_bracket}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
};
