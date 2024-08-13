export default function handleGSSPError(error) {
  console.log(error, 'hanldeGSSpError');
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
