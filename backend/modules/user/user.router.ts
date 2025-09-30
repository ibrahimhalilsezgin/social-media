import {Router} from "express";
import userController from "./user.controller";
import {authenticateToken,optionalAuthenticateToken} from "../../middleware/authentication"
import { createAccountValidation, signInValidation } from "../../validations/userValidation";
import { validateRequest } from "../../middleware/validation";
const router = Router();

router.post('/signup', createAccountValidation, validateRequest, userController.createAccount);
router.post('/signin', signInValidation, validateRequest, userController.SigIn);
router.post('/acceptFollowRequest', authenticateToken, userController.acceptFollowRequest);
router.post('/declineFollowRequest', authenticateToken, userController.declineFollowRequest);
router.post('/cancelFollowRequest', authenticateToken, userController.cancelFollowRequest);
router.post('/followUser', authenticateToken, userController.followUser);
router.post('/unFollowUser', authenticateToken, userController.unfollowUser);
router.get('/getUser', authenticateToken, userController.getUser);
router.get('/getUserProfilePhoto/:username', userController.getUserProfilePhoto);
router.get('/getUserFromUsername', optionalAuthenticateToken, userController.getUserFromUsername);
router.get('/getSelfInfo', authenticateToken, userController.getSelfInfo);
router.get('/getFollowRequests', authenticateToken, userController.getFollowRequests);
router.post('/updatePrivacy', authenticateToken, userController.updatePrivacy);
router.post('/updateProfile', authenticateToken, userController.updateProfile);
router.post('/updatePasword', authenticateToken, userController.updatePassword);

export default router;