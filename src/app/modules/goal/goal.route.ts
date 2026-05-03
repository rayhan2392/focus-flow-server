import { Router } from "express";
import { goalController } from "./goal.controller..js";
import { authenticate } from "../../middlewares/checkAuth.js";

const router = Router();

router.post("/:projectId", authenticate, goalController.createGoal)
router.get("/:projectId", authenticate, goalController.getWeeklyGoals)
router.patch("/:projectId/:goalId", authenticate, goalController.updateGoal)
router.delete("/:projectId/:goalId", authenticate, goalController.deleteGoal)




export const goalRoute = router;