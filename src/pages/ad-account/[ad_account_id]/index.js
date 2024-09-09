import { RemoveFromQueue } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  FormControl,
  Unstable_Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import ConfirmAction from 'src/components/ConfirmAction';
import Iframe from 'src/components/Iframe';
import ProtectDashboard from 'src/hocs/protectDashboard';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { getResourse } from 'src/lib/actions';

const Page = ({ adAccounts, adAccount, ads, campaignsLength }) => {
  const { query, replace } = useRouter();
  const handleSelectChange = (event) => {
    replace(`/ad-account/${event.target.value}`);
  };

  return (
    <>
      <Head>
        <title>Ad Account - {adAccount.name} | Devias Kit</title>
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
            <Typography variant="h4">Ad Account - {adAccount.name}</Typography>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} lg={4}>
                <FormControl fullWidth>
                  <InputLabel id="scrren-select-label">Select Screen</InputLabel>
                  <Select
                    id="screen-select"
                    labelId="scrren-select-label"
                    label="Select Screen"
                    value={query.ad_account_id}
                    onChange={handleSelectChange}
                  >
                    {adAccounts.list.map((item) => (
                      <MenuItem key={item.reference} value={item.reference}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <Card>
                  <CardHeader title="campaigns" />
                  <CardContent>
                    {campaignsLength === 0 && <Typography>No campaigns in Ad Account</Typography>}
                    {ads.length === 0 && campaignsLength > 0 && (
                      <Typography>No Ads in {campaignsLength} campaigns</Typography>
                    )}
                    <Grid container spacing={3}>
                      {ads.map((adFile) => (
                        <AdFileCard key={adFile.reference + adFile.campaignReference} {...adFile} />
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

const componentToAdTypeMap = {
  image: 'img',
  video: 'video',
  html: 'iframe',
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

export const getServerSideProps = ProtectDashboard(async (ctx) => {
  try {
    const [adAccounts, adAccount, campaigns] = await Promise.all([
      getResourse(ctx.req, '/ads-account'),
      getResourse(ctx.req, `/ads-account/${ctx.query.ad_account_id}`),
      getResourse(ctx.req, `/campaign/account/${ctx.query.ad_account_id}`),
    ]);

    const ads = campaigns.list.reduce((acc, item) => {
      const uploads = item.playUploads.map((upload) => {
        upload.campaignName = item.name;
        upload.campaignReference = item.reference;
        return upload;
      });
      return item.playUploads ? [...acc, ...uploads] : acc;
    }, []);

    return {
      props: {
        adAccounts,
        adAccount,
        ads,
        campaignsLength: campaigns.list.length,
      },
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

function AdFileCard({
  uploadType,
  reference,
  uploadFile,
  uploadName,
  campaignName,
  campaignReference,
}) {
  const { replace, asPath } = useRouter();
  const handleRemove = async () => {
    try {
      toast.promise(
        axios.post(`/api/admin/campaigns/ads/remove`, {
          campaign_id: campaignReference,
          uploadRef: reference,
        }),
        {
          loading: 'Removing Ad, Hang on...',
          success: (response) => {
            replace(asPath);
            return response.data.message;
          },
          error: (error) => error.response?.data?.message || error.message,
        }
      );
    } catch (error) {}
  };
  return (
    <Grid xs={6} sm={4} lg={3} key={reference}>
      <Card sx={{ height: '100%', flexDirection: 'column', display: 'flex' }}>
        {uploadType === 'html' ? (
          <Iframe content={uploadFile} />
        ) : (
          <CardMedia
            sx={{ height: 140 }}
            image={uploadFile}
            title={uploadName}
            component={componentToAdTypeMap[uploadType]}
          />
        )}
        <CardHeader sx={{ pt: 1, pb: 0 }} title={campaignName} />
        <CardActions sx={{ py: 1, mt: 'auto' }}>
          <Link href={`/campaign/edit-campaign/${campaignReference}`}>
            <Button>Edit</Button>
          </Link>
          <ConfirmAction
            action={handleRemove}
            color="error"
            buttonProps={{ color: 'error', variant: 'text', startIcon: <RemoveFromQueue /> }}
            proceedText="Remove Ad"
            title="Are you sure?"
            content="Are you sure you want to remove this ad?"
          >
            Remove
          </ConfirmAction>
        </CardActions>
      </Card>
    </Grid>
  );
}
