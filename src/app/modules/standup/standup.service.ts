import { prisma } from "../../../lib/prisma.js";
import AppError from "../../error/AppError.js";

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const createDailyStandup = async (
    userId: string,
    projectId: string,
    payload: { yesterday: string; today: string; blocker?: string }) => {

    // 1. Prevent multiple submissions on the same day (PRD Rule FR-04.9)
    const todayStart = getStartOfToday();

    const existingStandup = await prisma.standup.findFirst({
        where: {
            userId,
            projectId,
            createdAt: { gte: todayStart },
        },
    });

    if (existingStandup) {
        throw new AppError(409, "You have already submitted a standup for this project today. Edit your existing standup instead.");
    }

    // 2. Determine if the user is blocked
    const hasBlocker = !!payload.blocker && payload.blocker.trim().length > 0;

    const newStandup = await prisma.standup.create({
        data: {
            yesterday: payload.yesterday,
            today: payload.today,
            blocker: hasBlocker ? payload.blocker : null,
            hasBlocker,
            userId,
            projectId,
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            },
            project: {
                select: { workspaceId: true } // We need this to know which Socket room to emit to
            }
        }
    });
    return newStandup;
}

const getAllStandups = async (projectId: string, page: number = 1, limit: number = 10) => {

    const skip = (page - 1) * limit;

    const standups = await prisma.standup.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Newest first
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            }
        }
    });

    const total = await prisma.standup.count({
        where: { projectId }
    });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        data: standups
    };
}

const getStandupOfToday = async ( projectId: string) => {
    const todayStart = getStartOfToday();

    const standup = await prisma.standup.findFirst({
        where: {
            projectId,
            createdAt: { gte: todayStart },
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            }
        }
    });

    return standup;
}

const getBlockersStandup = async (projectId: string) => {
   

    const blockers = await prisma.standup.findMany({
        where: {
            projectId,
            hasBlocker: true,      
        },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            }
        }
    });

    return blockers;
}

const getMissingStandupsForToday = async (projectId: string) => {
    const todayStart = getStartOfToday();

    // Step A: Get the workspaceId for this project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true }
    });

    if (!project) throw new AppError(404, "Project not found");

    // Step B: Get ALL members of this workspace
    const allMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId: project.workspaceId },
        include: {
            user: { select: { id: true, name: true, email: true, avatarColor: true } }
        }
    });

    // Step C: Get ALL standups submitted TODAY for this project
    const todaysStandups = await prisma.standup.findMany({
        where: {
            projectId,
            createdAt: { gte: todayStart }
        },
        select: { userId: true }
    });

    // Step D: Extract just the user IDs of people who submitted
    const submittedUserIds = todaysStandups.map(s => s.userId);

    // Step E: Filter the allMembers list to find those who are NOT in the submitted list
    const missingMembers = allMembers
        .filter(member => !submittedUserIds.includes(member.userId))
        .map(member => member.user); // Just return the user details

    return missingMembers;
};

export const StandupService = {
    createDailyStandup,
    getAllStandups,
    getStandupOfToday,
    getBlockersStandup,
    getMissingStandupsForToday
}