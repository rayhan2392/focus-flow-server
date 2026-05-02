import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/checkAuth.js";


const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/refresh", authController.refresh)
router.post("/logout", authController.logout)
router.get("/me", authenticate, authController.getMe)


export const authRoutes = router;