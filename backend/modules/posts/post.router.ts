import { Request, Router } from "express";
import { authenticateToken } from "../../middleware/authentication";
import postController from "./post.controller";
import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/'); // 'uploads' klasörüne kaydet
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // dosya ismini benzersiz yap
  }
});

const upload = multer({ storage: storage });
const router = Router();

router.post('/create', authenticateToken, upload.array('images', 5) ,postController.createPost);
router.delete('/delete', authenticateToken, postController.deletePost);
router.get('/getUserPosts', authenticateToken, postController.getUserPosts);


export default router;