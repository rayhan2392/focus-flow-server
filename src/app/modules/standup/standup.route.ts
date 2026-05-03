import { Router } from "express";
import { StandupController } from "./standup.controller.js";
import { authenticate } from "../../middlewares/checkAuth.js";
import { checkProjectAdmin } from "../../middlewares/checkProjectAdmin.js";

const router = Router();

router.post("/:projectId", authenticate, StandupController.createDailyStandup);
router.get("/:projectId", authenticate, StandupController.getAllStandups);
router.get("/:projectId/today", authenticate, StandupController.getStandupOfToday);
router.get("/:projectId/blockers", authenticate, checkProjectAdmin, StandupController.getBlockersStandup);
router.get("/:projectId/missing-today", authenticate, checkProjectAdmin, StandupController.getMissingStandupsForToday);


export const standupRoutes = router;