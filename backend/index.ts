import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import moment from "moment";
import "dotenv/config";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import mongoose from "mongoose";
const app = express();
moment.locale('tr');
const PORT = process.env.PORT || 3000;
mongoose.set('strictPopulate', false)
mongoose.connect(process.env.mongouri || '').then(async () => {
    console.log('Database Bağlandı');
}).catch((err) => {
    console.log('Database Bağlanırken Sorun Oluştu Hata: ' + err);
});

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

app.use('/', userRouter);
app.use('/posts/', postRouter);




app.listen(PORT, () => {
    console.log(`http://${process.env.domain}:${PORT} Listing.`);
});