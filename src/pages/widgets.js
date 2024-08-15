import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const Page = () => {
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedAdAccount, setSelectedAdAccount] = useState('');

  const handleScreenSelect = (event) => {
    setSelectedScreen(event.target.value);
  };

  const handleAdAccountSelect = (event) => {
    setSelectedAdAccount(event.target.value);
  };

  const exportAsCSV = () => {
    if (!selectedScreen) {
      return toast.error('Please select a screen!');
    }
  };

  return (
    <>
      <Head>
        <title>Widgets | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Typography variant="h5">Widgets</Typography>
            <FormControl fullWidth>
              <InputLabel id="scrren-select-label">Select Screen</InputLabel>
              <Select
                labelId="scrren-select-label"
                id="screen-select"
                value={selectedScreen}
                label="Select Screen"
                onChange={handleScreenSelect}
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
            {selectedScreen ? (
              <Stack>
                <Typography>Existing Widgets</Typography>
                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <Widget />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Widget />
                  </Grid>
                </Grid>
              </Stack>
            ) : (
              <Typography variant="h6">Please select screen to view existing widgets.</Typography>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

function Widget() {
  return (
    <Card>
      <CardHeader title="Weather App" />
      <CardContent></CardContent>
      <CardActions>
        <Button variant="contained" fullWidth>
          Remove Widget
        </Button>
      </CardActions>
    </Card>
  );
}
