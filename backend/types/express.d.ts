import { User } from "../modules/user/user.interface";

declare module "express-serve-static-core" {
    interface Request {
        user: User
    }
}