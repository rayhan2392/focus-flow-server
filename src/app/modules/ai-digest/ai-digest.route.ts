import { Router } from "express";
import { aiDigestController } from "./ai-digest.controller.js";
import { authenticate } from "../../middlewares/checkAuth.js";
import { checkProjectAdmin } from "../../middlewares/checkProjectAdmin.js";

const router = Router();

router.post("/:projectId",
    authenticate,
    checkProjectAdmin,
    aiDigestController.generateDigest);

router.get("/:projectId",
    authenticate,
    aiDigestController.getDigests);

export const aiDigestRoute = router