import bodyParser from "body-parser";
import cors from "cors";
import moment from "moment";
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

app.use(morgan('dev'));

import userRouter from "./modules/user/user.router";
import postRouter from "./modules/posts/post.router";
import conversationRouter from "./modules/conversations/conversations.router";

import { connectDB } from "./db/connect";
import conversationsModel from "./modules/conversations/conversations.model";

app.use('/', userRouter);
app.use('/posts/', postRouter);
app.use('/conversations/', conversationRouter);

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

let onlineUsers = [];


io.on("connection", (socket) => {
  const username = socket.data.user.username;

  if (!onlineUsers.includes(username)) {
    onlineUsers.push(username);
  }

  socket.join(username);
  io.emit('onlineUsers', onlineUsers);

  // Kullanıcı odaya katılıyor
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
  });

  socket.on("messageCreate", async (data) => {
    await conversationsModel.updateMany(
      { id: data.conversation.id },
      {
        $push: {
          messages: {
            username: data.conversation.username,
            content: data.message,
            created: new Date()

          },
        },
      }
    );

    // Sadece ilgili odaya mesajı gönder
    io.to(data.conversation.id).emit("createdMessage", {
      username: data.conversation.username,
      content: data.message,
      created: new Date()
      
    });
  });

  socket.on("disconnect", () => {
    const index = onlineUsers.indexOf(username);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
    }
    io.emit("onlineUsers", onlineUsers);
  });
});





httpServer.listen(PORT, process.env.host, () => {
    console.log(`${process.env.domain}:${PORT} Listing.`);
});