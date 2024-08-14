import { parse } from 'cookie';
import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

function ProtectDashboard(getServerSideProps) {
  return async function getServerSidePropsHOC(context) {
    const userAuthToken = parse(context.req.headers.cookie)?.[ADMIN_COOKIE_NAME];
    return getServerSideProps(context, userAuthToken);
    // if (userAuthToken === undefined) {
    //   return {
    //     redirect: {
    //       destination: '/auth/login?auth=false',
    //       permanent: false,
    //     },
    //   };
    // } else {
    //   return getServerSideProps(context, userAuthToken);
    // }
  };
}

export default ProtectDashboard;
