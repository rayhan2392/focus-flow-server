import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { workspaceRoutes } from "../modules/workspace/workspace.route.js";



const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/workspace",
        route: workspaceRoutes
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

export default router;