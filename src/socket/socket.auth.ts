import { Socket } from "socket.io";
import { verifyToken } from "../app/utils/jwt.js";
import { envVars } from "../app/config/env.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../app/error/AppError.js";
import { MySocketData } from "../app/interfaces/socket.interfaces.js";




export const socketAuthMiddleware = async (socket: Socket<any, any, any, MySocketData>, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new AppError(401, "No token provided"));
        }

        const decoded = verifyToken(token, envVars.JWT_SECRET);

        // Ensure userId exists on the decoded token
        const userId = (decoded as any).userId;
        if (!userId || typeof userId !== 'string') {
            return next(new AppError(401, "Invalid token payload"));
        }

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return next(new AppError(401, "User not found"));
        }

        const memberships = await prisma.workspaceMember.findMany({
            where: { userId },
            select: { workspaceId: true }
        });

        // If user has no workspace memberships, still allow connection but with empty array
        socket.data = {
            userId,
            workspaceIds: memberships.map(m => m.workspaceId)
        };

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }
        // Wrap other errors in AppError for consistency
        const message = error instanceof Error ? error.message : "Invalid or expired token";
        next(new AppError(401, message));
    }
};

