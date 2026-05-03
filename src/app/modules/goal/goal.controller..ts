import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { goalService } from "./goal.service.js";


const createGoal = catchAsync(async (req, res) => {
    const { projectId } = req.params as { projectId: string };
    const { title } = req.body;
    const newGoal = await goalService.createGoal(req.user!.id, projectId, { title });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Goal created successfully",
        data: newGoal
    });
});

const getWeeklyGoals = catchAsync(async (req, res) => {
    const { projectId } = req.params as { projectId: string };
    const goals = await goalService.getWeeklyGoals(projectId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Weekly goals retrieved successfully",
        data: goals
    });
})

const updateGoal = catchAsync(async (req, res) => {
    const { projectId, goalId } = req.params as { projectId: string, goalId: string };
    const userId = (req as any).user.id;

    const { progress, status } = req.body;

    const updatedGoal = await goalService.updateGoal(
        userId, goalId, projectId, { progress, status }
    );

    // --- REAL-TIME SOCKET EMISSION ---
    const io = req.app.get("io");
    const workspaceId = updatedGoal.project.workspaceId;

    // Broadcast the update to the workspace room
    io.to(`workspace:${workspaceId}`).emit("goal:updated", {
        goal: updatedGoal,
        workspaceId
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Goal updated successfully",
        data: updatedGoal
    });
})

const deleteGoal = catchAsync(async (req, res) => {
    const { projectId, goalId } = req.params as { projectId: string, goalId: string };
    const userId = (req as any).user.id;

    await goalService.deleteGoal(userId, goalId, projectId);


    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Goal deleted successfully",
        data: null
    });
})

export const goalController = {
    createGoal,
    getWeeklyGoals,
    updateGoal,
    deleteGoal
}
