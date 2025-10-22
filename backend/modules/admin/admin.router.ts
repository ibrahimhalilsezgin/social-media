import { onlyAdmin } from "../../middleware/authentication";

import { Router } from "express";
import adminController from "./admin.controller";

const router = Router();

router.get('/', onlyAdmin, adminController.stats);
router.delete('/user', onlyAdmin, adminController.deleteUser)
router.post('/restrict', onlyAdmin, adminController.restrict);
export default router;