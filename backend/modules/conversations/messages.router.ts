import { Request, Router } from "express";
import { authenticateToken } from "../../middleware/authentication";
import postController from "./messages.controller";
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



export default router;