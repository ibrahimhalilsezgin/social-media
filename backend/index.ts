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
        origin:['http://localhost:5173']
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
import { connectDB } from "./db/connect";

app.use('/', userRouter);
app.use('/posts/', postRouter);

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
io.on("connection", (socket) => {
    // console.log(socket)
  const username = socket.data.user.username;
  socket.join(username); // kullanıcı kendi odasına
  console.log(username, ' bildirim sistemine girdi')
});




httpServer.listen(PORT, () => {
    console.log(`http://${process.env.domain}:${PORT} Listing.`);
});