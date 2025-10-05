// src/lib/socket.ts
import { browser } from "$app/environment";
import { io, type Socket } from "socket.io-client";
import { getCookie } from "$lib/utils/cookies.util";
import { PUBLIC_BACKEND_URL } from '$env/static/public';

export let socket: Socket | null = null;

if (browser) {
  socket = io(PUBLIC_BACKEND_URL, {
    auth: { token: getCookie("token") },
  });
}
