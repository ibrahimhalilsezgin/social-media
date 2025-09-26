import jwt from 'jsonwebtoken';
import type { Handle } from '@sveltejs/kit';
import {PRIVATE_SECRET_KEY} from "$env/static/private"
export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('token');

  if (token) {
    try {
      const decoded = jwt.verify(token, PRIVATE_SECRET_KEY);
      event.locals.user = decoded;
      event.locals.token = token;
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
