import { parse } from 'cookie';
import { ADMIN_COOKIE_NAME } from './constants';

export default function getCookie(req) {
  return parse(req.headers.cookie)?.[ADMIN_COOKIE_NAME];
}
