import { ADMIN_COOKIE_NAME } from './constants';

export default function handleGSSPError(error, contextOrRes) {
  const res = contextOrRes?.res || contextOrRes;
  const req = contextOrRes?.req;

  if (error?.response?.status === 401) {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=deleted; Max-Age=-1; HttpOnly; Path=/`);
    }

    const continuePath = req?.url;
    const hasContinue = continuePath && continuePath !== '/' && !continuePath.startsWith('/auth');
    const destination = hasContinue
      ? `/auth/login?auth=false&continueUrl=${encodeURIComponent(continuePath)}`
      : '/auth/login?auth=false';

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  console.error('handleGSSPError caught non-401 error:', error?.message || error);

  return {
    notFound: true,
  };
}
