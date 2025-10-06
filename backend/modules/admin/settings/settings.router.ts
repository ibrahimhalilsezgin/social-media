import { onlyAdmin } from "../../../middleware/authentication";

import { Router } from "express";
import settingsController from "./settings.controller";

const router = Router();

router.get('/', onlyAdmin, settingsController.getSettings);

export default router;