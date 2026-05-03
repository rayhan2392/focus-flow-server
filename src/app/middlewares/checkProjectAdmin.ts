import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js'; // Adjust path
import AppError from '../error/AppError.js'; // Adjust path

export const checkProjectAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const  projectId  = req.params.projectId  as string ;
        const userId = (req as any).user.id; // From your authenticate middleware

        // 1. Find the project to figure out which workspace it belongs to
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { workspaceId: true }
        });

        if (!project) {
            return next(new AppError(404, "Project not found"));
        }

        // 2. Check the user's role in that specific workspace
        const membership = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId,
                    workspaceId: project.workspaceId
                }
            }
        });

        // 3. Reject if they aren't a member or aren't an ADMIN
        if (!membership || membership.role !== 'ADMIN') {
            return next(new AppError(403, "Insufficient permissions. Admin access required."));
        }

        // User is an admin, proceed to the controller!
        next();
    } catch (error) {
        next(error);
    }
};