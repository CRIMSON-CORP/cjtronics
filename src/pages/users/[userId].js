import Head from 'next/head';
import { Box, Container, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { AccountProfile } from 'src/sections/account/account-profile';
import { AccountProfileDetails } from 'src/sections/account/account-profile-details';
import ProtectDashboard from 'src/hocs/protectDashboard';
import axios from 'src/lib/axios';
import useProtectPage from 'src/hooks/useProtectPage';
import permissions from 'src/utils/permissions-config';
import Link from 'next/link';
import handleGSSPError from 'src/utils/handle-gssp-error';

const Page = ({ user, roles, ageBracket }) => {
  useProtectPage(permissions.view_user_details);
  return (
    <>
      <Head>
        <title>User | Devias Kit</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">
                <Link href="/user">
                  <span style={{ opacity: 0.5, color: 'black', textDecorationColor: 'black' }}>
                    User
                  </span>
                </Link>{' '}
                / {user.firstname} {user.lastname}
              </Typography>
            </div>
            <div>
              <Grid container spacing={3}>
                <Grid xs={12} md={6} lg={4}>
                  <AccountProfile user={user} />
                </Grid>
                <Grid xs={12} md={6} lg={8}>
                  <AccountProfileDetails user={user} roles={roles} ageBracket={ageBracket} />
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export const getServerSideProps = ProtectDashboard(async (ctx, userAuthToken) => {
  const fetchParams = {
    headers: {
      Authorization: `Bearer ${userAuthToken}`,
    },
  };
  try {
    const userDetailsFetch = axios.get(`/admin/user/details/${ctx.query.userId}`, fetchParams);

    const appSettingsFetch = axios.get('/admin/setting/list', fetchParams);

    const rolesFetch = axios.get(`/admin/role/list/`, fetchParams);

    const [userDetails, appSettings, roles] = await Promise.all([
      userDetailsFetch,
      appSettingsFetch,
      rolesFetch,
    ]);

    const ageBracket =
      appSettings.data.data.app_settings.find((setting) => setting.key === 'age_range')?.value ??
      [];

    return {
      props: {
        user: userDetails?.data?.data?.user,
        roles: roles?.data?.data?.roles,
        ageBracket,
      },
    };
  } catch (error) {
    return handleGSSPError(error);
  }
});

export default Page;
