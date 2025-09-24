import {Router} from "express";
import userController from "./user.controller";
import {authenticateToken} from "../../middleware/authentication"
const router = Router();


router.post('/signup', userController.createAccount);
router.post('/signin', userController.SigIn);
router.get('/getUser', authenticateToken, userController.getUser);

export default router;