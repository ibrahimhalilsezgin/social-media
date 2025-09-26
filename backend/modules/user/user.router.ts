import {Router} from "express";
import userController from "./user.controller";
import {authenticateToken} from "../../middleware/authentication"
const router = Router();

router.post('/signup', userController.createAccount);
router.post('/signin', userController.SigIn);
router.post('/acceptFollowRequest', authenticateToken, userController.acceptFollowRequest);
router.post('/declineFollowRequest', authenticateToken, userController.declineFollowRequest);
router.post('/followUser', authenticateToken, userController.followUser);
router.post('/unFollowUser', authenticateToken, userController.unfollowUser);
router.get('/getUser', authenticateToken, userController.getUser);
router.get('/getUserFromUsername', userController.getUserFromUsername);
router.get('/getSelfInfo', authenticateToken, userController.getSelfInfo);
router.get('/getFollowRequests', authenticateToken, userController.getFollowRequests);

export default router;