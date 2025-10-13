import {Router, Request} from "express";
import userController from "./user.controller";
import {authenticateToken,optionalAuthenticateToken} from "../../middleware/authentication"
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();


const storage = multer.diskStorage({
  destination: function (req:Request, file, cb) {
      const user = req.user.username
      if(!user) return;
      const uploadPath = path.join('./profilePhotos');
    
      fs.mkdirSync(uploadPath, { recursive: true })
      cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const unique = req.user.username + '.jpeg';
    cb(null, unique);
  }
});

const upload = multer({ storage: storage });

router.post('/signup', userController.createAccount);
router.post('/signin', userController.SigIn);
router.post('/acceptFollowRequest', authenticateToken, userController.acceptFollowRequest);
router.post('/declineFollowRequest', authenticateToken, userController.declineFollowRequest);
router.post('/cancelFollowRequest', authenticateToken, userController.cancelFollowRequest);
router.post('/followUser', authenticateToken, userController.followUser);
router.post('/unFollowUser', authenticateToken, userController.unfollowUser);
router.post('/updatePrivacy', authenticateToken, userController.updatePrivacy);
router.post('/updateProfile', authenticateToken, userController.updateProfile);
router.post('/updatePasword', authenticateToken, userController.updatePassword);
router.post('/updateProfilePhoto',authenticateToken, upload.single('file'), userController.updateProfilePhoto);


router.get('/getUser', authenticateToken, userController.getUser);
router.get('/getUserProfilePhoto/:username', userController.getUserProfilePhoto);
router.get('/getUserFromUsername', optionalAuthenticateToken, userController.getUserFromUsername);
router.get('/getSelfInfo', authenticateToken, userController.getSelfInfo);
router.get('/getFollowRequests', authenticateToken, userController.getFollowRequests);
export default router;