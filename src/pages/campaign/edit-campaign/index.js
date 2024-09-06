import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ campaign }) => {
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const { replace } = useRouter();

  const handleSelectChange = (event) => {
    setSelectedCampaign(event.target.value);
    replace(`/campaign/edit-campaign/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Edit campaign | Devias Kit</title>
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
            <Typography variant="h5">Edit Campaign</Typography>
            <FormControl fullWidth>
              <InputLabel id="campaign-select-label">Select Campaign</InputLabel>
              <Select
                id="campaign-select"
                labelId="campaign-select-label"
                label="Select Campaign"
                value={selectedCampaign}
                onChange={handleSelectChange}
              >
                {campaign.list.map((item) => (
                  <MenuItem key={item.reference} value={item.reference}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="h6">Please select campaign to edit.</Typography>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [campaign] = await Promise.all([getResourse(ctx.req, '/ads/campaign')]);
    return {
      props: { campaign },
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
});
