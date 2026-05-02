import { Router } from "express";
import { authenticate } from "../../middlewares/checkAuth.js";
import { workspaceController } from "./workspace.controller.js";
import { requireRole } from "../../middlewares/role.js";

const router = Router();

router.post("/create", authenticate, workspaceController.createWorkspace)
router.get("/mine", authenticate, workspaceController.getMyWorkspaecs)
router.get("/:workspaceId", authenticate, workspaceController.getSingleWorkspace)
router.post("/:workspaceId/invite", authenticate, requireRole("ADMIN"), workspaceController.inviteMember)
router.patch("/:workspaceId/members/:userId", authenticate, requireRole("ADMIN"), workspaceController.changeMemberRole)
router.delete("/:workspaceId/members/:userId", authenticate, requireRole("ADMIN"), workspaceController.removeWorkspaceMember)

export const workspaceRoutes = router;