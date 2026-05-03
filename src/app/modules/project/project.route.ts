import { Router } from "express";
import { projectController } from "./project.controller.js";
import { authenticate } from "../../middlewares/checkAuth.js";
import { requireRole } from "../../middlewares/role.js";

const router = Router();


router.get("/:workspaceId/projects", authenticate, projectController.getProjects);
router.post("/:workspaceId/projects", authenticate, requireRole("ADMIN"), projectController.createProject);
router.patch("/:workspaceId/projects/:projectId", authenticate, requireRole("ADMIN"), projectController.updateProject);
router.delete("/:workspaceId/projects/:projectId", authenticate, requireRole("ADMIN"), projectController.deleteProject);

export const projectRoute = router;