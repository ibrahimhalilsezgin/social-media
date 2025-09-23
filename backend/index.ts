import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import moment from "moment";
import "dotenv/config";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const app = express();
moment.locale('tr');
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

app.use(limiter);
app.use(bodyParser.urlencoded({}));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));





app.listen(PORT, () => {
    console.log(`http://${process.env.domain}:${PORT} Listing.`);
});