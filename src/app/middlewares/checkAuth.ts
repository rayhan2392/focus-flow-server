import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { envVars } from "../config/env.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../error/AppError.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError(401, "No token provided")
    }

    const token = authHeader.split(" ")[1];


    try {
        const payload = verifyToken(token, envVars.JWT_SECRET);
        console.log(payload);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, email: true, name: true },
        });
        if (!user) return res.status(401).json({ error: "User not found" });
        req.user = user;
        next();
    } catch {
        throw new AppError(401, "Invalid or expired token");
    }
};

