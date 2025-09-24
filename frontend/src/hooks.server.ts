import {PRIVATE_SECRET_KEY} from "$env/static/private"
import jwt from "jsonwebtoken";
import type { Handle } from "@sveltejs/kit";
export const handle: Handle = async ({ event, resolve }) => {

	const token = event.cookies.get('token');
	if (token) {
		try {
			const decoded = jwt.verify(token, PRIVATE_SECRET_KEY);
			console.log(decoded)
			if (decoded){
				event.locals.user = decoded;
				event.locals.token = token;
			} else {
				event.locals.user = null
			}
		} catch {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	// 👇 BU ÇAĞRI ZORUNLU
	return resolve(event);
};
  const url = import.meta.env.URL;


  