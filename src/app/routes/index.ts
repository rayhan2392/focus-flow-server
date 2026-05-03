import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { workspaceRoutes } from "../modules/workspace/workspace.route.js";
import { projectRoute } from "../modules/project/project.route.js";
import { standupRoutes } from "../modules/standup/standup.route.js";




const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/workspace",
        route: workspaceRoutes
    },
    {
        path: "/project",
        route: projectRoute
    },
    {
        path: "/standup",
        route : standupRoutes
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

export default router;