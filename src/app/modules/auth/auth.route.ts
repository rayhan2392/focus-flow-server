import { Router } from "express";
import { authController } from "./auth.controller.js";


const router = Router();

router.post("/register",authController.register)


export const authRoutes = router;