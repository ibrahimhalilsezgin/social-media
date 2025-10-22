import bodyParser from "body-parser";
import cors from "cors";
import geoip from "geoip-lite"
import "dotenv/config";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import * as express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
const app = express.default();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors:{
        origin:['http://localhost:5173', ]
    }
});
connectDB();
const PORT = process.env.PORT || 3000;


const limiter = rateLimit({
    windowMs: 2 * 1000,
    max:100,
    handler: function(req, res, next) {
        res.send('Rate-Limit!!!!');
        setTimeout(function() {
            next();
        }, 3000)
    }
});
app.use(cors());
app.use(limiter);
app.use(bodyParser.urlencoded({}));
app.use(bodyParser.json());
app.set('trust proxy', true)
app.use(morgan('dev'));

import userRouter from "./modules/user/user.router";
import postRouter from "./modules/posts/post.router";
import adminRouter from "./modules/admin/admin.router";
import conversationRouter from "./modules/conversations/conversations.router";

import { connectDB } from "./db/connect";
import conversationsModel from "./modules/conversations/conversations.model";
import settingsModel from "./modules/admin/admin.model";
import { sendNotification } from "./utils/notification";
import userModel from "./modules/user/user.model";

app.use('/', userRouter);
app.use('/posts/', postRouter);
app.use('/conversations/', conversationRouter);
app.use('/admin/', adminRouter);

app.get('/', (req, res) => res.send(200))
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = jwt.verify(token, process.env.secretKey);
    socket.data.user = payload; // userId vs sakla
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});
app.set("io", io)

let onlineUsers = new Map();

io.on("connection", async (socket) => {
  const ip = getClientIpFromSocket(socket);
  const geo = geoip.lookup(ip);
  const country = geo?.country || "Unknown";
  await addAccessCountry(ip, country);

  const username = socket.data?.user?.username;
  if (!username) {
    socket.disconnect();
    return;
  }

  // if (onlineUsers.has(username)) {
  //   const oldSocketId = onlineUsers.get(username);
  //   const oldSocket = io.sockets.sockets.get(oldSocketId);
  //   if (oldSocket) oldSocket.disconnect(true);
  // }

  // onlineUsers.set(username, socket.id);
  socket.join(username);

  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // Odaya katılma
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
  });

  // Mesaj oluşturma
  socket.on("messageCreate", async (data) => {
    const user = await userModel.findOne({  username: data.conversation.username });

    if(user.user_blocked_features.includes('sendMessage')) return;
    await conversationsModel.updateMany(
      { id: data.conversation.id },
      {
        $push: {
          messages: {
            username: data.conversation.username,
            content: data.message,
            created: new Date(),
          },
        },
      }
    );

    sendNotification(io, data.conversation.with, {
      title: "Yeni mesaj aldın.",
      content: "Mesaj aldın",
      url: `/direct/${data.conversation.username}/${data.conversation.id}`,
      image: `http://${process.env.domain}${
        process.env.PORT ? ":" + process.env.PORT : ""
      }/getUserProfilePhoto/${data.conversation.username}`,
      socket: io,
    }).finally(() => {

      io.to(data.conversation.id).emit("createdMessage", {
        username: data.conversation.username,
        content: data.message,
        created: new Date(),
      });
    })

  });

  // Bağlantı kopunca listeden kaldır
  socket.on("disconnect", () => {
    if (onlineUsers.get(username) === socket.id) {
      onlineUsers.delete(username);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

function getClientIpFromSocket(socket) {
  const headers = socket.handshake?.headers || {};

  if (headers['cf-connecting-ip']) {
    return headers['cf-connecting-ip'];
  }

  if (headers['x-forwarded-for']) {
    const list = headers['x-forwarded-for'].split(',').map(s => s.trim());
    if (list.length) return list[0];
  }

  if (headers['true-client-ip']) return headers['true-client-ip'];

  const addr = socket.handshake.address || socket.conn?.remoteAddress;
  if (!addr) return null;
  console.log(addr)
  return addr.replace('::ffff:', '');
}

async function addAccessCountry(ip, country) {
  let settings = await settingsModel.findOne();
  if (!settings) {
    settings = new settingsModel({ accessCountry: [] });
  }

  let countryRecord = settings.accessCountry.find(c => c.country === country);

  if (!countryRecord) {
    settings.accessCountry.push({
      country,
      ipList: [ip],
      count: 1
    });
  } else {
    if (!countryRecord.ipList.includes(ip)) {
      countryRecord.ipList.push(ip);
      countryRecord.count++;
    }
  }

  await settings.save();
}




httpServer.listen(PORT, process.env.host, () => {
    console.log(`${process.env.domain}:${PORT} Listing.`);
});