import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { WorkspaceRole } from "../../generated/client/browser.js";



export const requireRole = (role: WorkspaceRole) =>
    async (req: Request, res: Response, next: NextFunction) => {
        // workspaceId can come from different param names
        const workspaceId = Array.isArray(req.params.workspaceId)
            ? req.params.workspaceId[0]
            : Array.isArray(req.params.wId)
                ? req.params.wId[0]
                : req.params.workspaceId || req.params.wId;

        if (!workspaceId) return res.status(400).json({ error: "No workspaceId in params" });

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const membership = await prisma.workspaceMember.findUnique({
            where: { userId_workspaceId: { userId: req.user.id, workspaceId } },
        });

        if (!membership || membership.role !== role) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }


        req.membership = membership;
        next();
    };

