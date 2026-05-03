import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StandupService } from "./standup.service.js";

const createDailyStandup = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;
    const userId = req.user!.id;
    const payload = req.body;

    const newStandup = await StandupService.createDailyStandup(userId, projectId, payload);

       // Real-Time Socket Emissions
        const io = req.app.get("io");
        const workspaceId = newStandup.project.workspaceId;
        const roomName = `workspace:${workspaceId}`;

        // Emit A: The new standup data to the whole workspace
        io.to(roomName).emit("standup:new", {
            newStandup,
            workspaceId
        });

        // Emit B: Trigger the admin toast alert if the user is blocked
        if (newStandup.hasBlocker) {
            io.to(roomName).emit("blocker:flagged", {
                userId: newStandup.user.id,
                userName: newStandup.user.name,
                projectId: projectId,
                blockerText: newStandup.blocker
            });
        }

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Standup created successfully",
        data: newStandup
    });
});

const getAllStandups = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await StandupService.getAllStandups(projectId, page, limit);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Standups retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getStandupOfToday = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;

    const standup = await StandupService.getStandupOfToday(projectId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Today's standup retrieved successfully",
        data: standup
    });
});

const getBlockersStandup = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;

    const blockers = await StandupService.getBlockersStandup(projectId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Blockers standups retrieved successfully",
        data: blockers
    });
});

const getMissingStandupsForToday = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;

    const missingStandups = await StandupService.getMissingStandupsForToday(projectId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Missing standups for today retrieved successfully",
        data: missingStandups           
    });
});

export const StandupController = {
    createDailyStandup,
    getAllStandups,
    getStandupOfToday,
    getBlockersStandup,
    getMissingStandupsForToday
}

