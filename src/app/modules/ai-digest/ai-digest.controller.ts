import { Request, Response } from 'express';
import { prisma } from '../../../lib/prisma.js';
import AppError from '../../error/AppError.js';
import { aiDigestService } from './ai-digest.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';

const generateDigest = catchAsync(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const { type } = req.body;

    // Validate the payload
    if (!type || !['DAILY', 'WEEKLY_RETRO'].includes(type)) {
        throw new AppError(400, "You must specify a valid type: 'DAILY' or 'WEEKLY_RETRO'");
    }

    const digest = await aiDigestService.generateDigest(projectId, type);

    // Real-Time Socket Broadcast
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true }
    });

    if (project) {
        const io = req.app.get("io");
        const alertMsg = type === 'DAILY' ? "New Daily Briefing is ready!" : "New Weekly Retro is ready!";

        io.to(`workspace:${project.workspaceId}`).emit("digest:ready", {
            message: alertMsg,
            digest
        });
    }

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Digest generated successfully",
        data: digest
    });
});

const getDigests = catchAsync(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const { type } = req.query;

    const digests = await prisma.aiDigest.findMany({
        where: {
            projectId,
            ...(type && { type: type as any })
        },
        orderBy: { digestDate: 'desc' }
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Digests retrieved successfully",
        data: digests
    });
});

export const aiDigestController = {
    generateDigest,
    getDigests
};