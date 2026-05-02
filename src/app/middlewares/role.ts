import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { WorkspaceRole } from "../../generated/client/browser.js";
import AppError from "../error/AppError.js";



export const requireRole = (role: WorkspaceRole) =>
    async (req: Request, res: Response, next: NextFunction) => {
        // workspaceId can come from different param names
        const workspaceId = Array.isArray(req.params.workspaceId)
            ? req.params.workspaceId[0]
            : Array.isArray(req.params.wId)
                ? req.params.wId[0]
                : req.params.workspaceId || req.params.wId;

        if (!workspaceId) {
            throw new AppError(400, "No workspaceId in params");
        }

        if (!req.user) {
            throw new AppError(401, "Unauthorized");
        }

        const membership = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: req.user.id, workspaceId } },
        });

        if (!membership || membership.role !== role) {
            throw new AppError(403, "Insufficient permissions");
        }


        req.membership = membership;
        next();
    };

