import { ADMIN_COOKIE_NAME } from 'src/utils/constants';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return;
  }

  response
    .setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=deleted; Max-Age=-1; HttpOnly; Path=/`)
    .end();
}
