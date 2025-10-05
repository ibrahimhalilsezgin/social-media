import { Request, Router } from "express";
import { authenticateToken, optionalAuthenticateToken } from "../../middleware/authentication";
import postController from "./post.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
const storage = multer.diskStorage({
  destination: function (req:Request, file, cb) {
      const user = req.user.username
      if(!user) return;
      const uploadPath = path.join(__dirname, 'uploads', user);
    
      fs.mkdirSync(uploadPath, { recursive: true })
      cb(null, uploadPath);
  },
  filename: function (req, file, cb) {

    const unique = randomUUID() + '.jpeg';
    cb(null, unique);
  }
});

const upload = multer({ storage: storage });
const router = Router();

router.get("/get/:filename", optionalAuthenticateToken, postController.getPostImage);
router.get("/getInfo/:filename", optionalAuthenticateToken, postController.getInfo);
router.post("/postPage/", optionalAuthenticateToken, postController.postPage);
router.post('/create', authenticateToken, upload.single("file") ,postController.createPost);
router.delete('/delete', authenticateToken, postController.deletePost);
router.get('/getUserPosts', authenticateToken, postController.getUserPosts);
router.post('/like', authenticateToken, postController.like);
router.post('/getLikes', authenticateToken, postController.getLikes);
router.post('/createComment', authenticateToken, postController.createComment);
router.post('/getComments', authenticateToken, postController.getComments);
router.delete('/delete', authenticateToken, postController.deletePost);
router.get('/', authenticateToken, postController.home)
export default router;