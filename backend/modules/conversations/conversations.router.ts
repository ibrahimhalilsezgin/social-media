import { Request, Router } from "express";
import { authenticateToken } from "../../middleware/authentication";
import conversationsController from "./conversations.controller";
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


router.get('/getChat/:username/:id', authenticateToken, conversationsController.getChat)
router.get('/getConversations', authenticateToken, conversationsController.getUserConversations)
router.post('/createConversation', authenticateToken, conversationsController.createConversation)


export default router;