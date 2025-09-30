// src/lib/socket.ts
import { browser } from "$app/environment";
import { io, type Socket } from "socket.io-client";
import { getCookie } from "../utils/cookies.util";

export let socket: Socket | null = null;

if (browser) {
  socket = io("http://localhost:3000", {
    auth: { token: getCookie("token") },
  });
}
