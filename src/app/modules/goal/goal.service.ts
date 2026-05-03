import { prisma } from '../../../lib/prisma.js'; // Adjust path
import AppError from '../../error/AppError.js';

// Helper to get exactly Monday 00:00:00 UTC of the current week
const getCurrentMondayUTC = () => {
    const d = new Date();
    const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
    // If today is Sunday (0), go back 6 days to Monday. Otherwise, go back (day - 1) days.
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);

    // Create new date at midnight UTC
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
};

const verifyGoalOwnerOrAdmin = async (userId: string, goalId: string, projectId: string) => {
    // 1. Fetch the goal AND include the project to get the workspaceId
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: {
            project: { select: { workspaceId: true } }
        }
    });

    // 2. Does the goal exist, and does it belong to the project in the URL?
    if (!goal || goal.projectId !== projectId) {
        throw new AppError(404, "Goal not found");
    }

    // 3. OWNER CHECK: If the user created this goal, they are authorized!
    if (goal.userId === userId) {
        return goal; // Success! Return the goal so we can use it.
    }

    // 4. ADMIN CHECK: If they aren't the owner, check if they are an ADMIN in this workspace
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: userId,
                workspaceId: goal.project.workspaceId
            }
        }
    });

    if (!membership || membership.role !== 'ADMIN') {
        // If they aren't the owner AND aren't an admin, kick them out.
        throw new AppError(403, "Forbidden. You can only modify your own goals unless you are an Admin.");
    }

    // Success! They are an Admin.
    return goal;
};

const createGoal = async (
    userId: string,
    projectId: string,
    payload: { title: string }
) => {
    const weekStart = getCurrentMondayUTC();


    const newGoal = await prisma.goal.create({
        data: {
            title: payload.title,
            weekStart,
            userId,
            projectId
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            }
        }
    });

    return newGoal;
};

const getWeeklyGoals = async (projectId: string) => {
    const weekStart = getCurrentMondayUTC();

    const goals = await prisma.goal.findMany({
        where: {
            projectId,
            weekStart
        },
        orderBy: {
            createdAt: "asc"
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarColor: true }
            }
        }
    });
    return goals;
};

const updateGoal = async (
    userId: string,
    goalId: string,
    projectId: string,
    payload: { progress?: number; status?: 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' },
    
) => {


    const goal = await verifyGoalOwnerOrAdmin(userId, goalId, projectId);

    let finalProgress = payload.progress !== undefined ? payload.progress : goal.progress;
    let finalStatus = payload.status !== undefined ? payload.status : goal.status;

    // Rule A: If progress hits 100, force status to COMPLETED
    if (finalProgress === 100 && finalStatus !== 'BLOCKED') {
        finalStatus = 'COMPLETED';
    } 
    // Rule B: If they drop progress below 100, but status is still COMPLETED, revert it
    else if (finalProgress < 100 && finalStatus === 'COMPLETED') {
        finalStatus = 'IN_PROGRESS';
    }

    const updatedGoal = await prisma.goal.update({
        where: { id: goal.id },
        data: {
            ...(payload.progress !== undefined && { progress: payload.progress }),
            ...(payload.status && { status: payload.status })
        },
        include: {
            user: { select: { id: true, name: true, email: true, avatarColor: true } },
            project: { select: { workspaceId: true } } // Needed for Socket room emission
        }
    });

    return updatedGoal;

}

const deleteGoal = async (userId: string, goalId: string, projectId: string) => {
    await verifyGoalOwnerOrAdmin(userId, goalId, projectId);

    await prisma.goal.delete({
        where: { id: goalId }
    });

    return;
}

export const goalService = {
    createGoal,
    getWeeklyGoals,
    updateGoal,
    deleteGoal
}
