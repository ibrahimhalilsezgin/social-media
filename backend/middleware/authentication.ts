import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../modules/user/user.interface";
export const authenticateToken = (req:Request, res:Response, next:NextFunction) => {
    const header = req.headers.authorization;
    // console.log(header)
    
    if(!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token Geçersiz'});
    }


    const token = header.split(" ")[1];
    try {
        const decoded:User = jwt.verify(token, process.env.SecretKey);

        req.user = {
            id:decoded.id,
            username:decoded.username,
            email: decoded.email
        };
        next();
    } catch (err) {
        return res.status(403);
    }
};
export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        // Token yoksa sadece req.user boş bırak ve devam et
        req.user = undefined;
        return next();
    }

    const token = header.split(" ")[1];

    try {
        const decoded: User = jwt.verify(token, process.env.SecretKey) as User;

        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
        };

        next();
    } catch (err) {
        // Token geçersiz olsa da req.user boş bırak ve devam et
        req.user = undefined;
        next();
    }
};