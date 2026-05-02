import { WorkspaceRole } from "../../../generated/client/enums.js"
import { catchAsync } from "../../utils/catchAsync.js"
import { sendResponse } from "../../utils/sendResponse.js"
import { workspaceService } from "./workspace.service.js"

const createWorkspace = catchAsync(async (req, res) => {
    const result = await workspaceService.createWorkspace(req, req.body.name)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Workspace created successfully",
        data: result
    })
})

const getMyWorkspaecs = catchAsync(async (req, res) => {
    const result = await workspaceService.getMyWorkspaces(req)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "My workspaces retrived successfully",
        data: result
    })
})

const getSingleWorkspace = catchAsync(async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const result = await workspaceService.getSingleWorkspace(workspaceId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Workspace retrived successfully",
        data: result
    })
})
//in futrue, we will implement invitiation accept and reject flow, so for now we will just create the invitation and not add the user to workspace directly
const inviteMember = catchAsync(async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const email = req.body.email as string;
    const result = await workspaceService.inviteMember(email, workspaceId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Member invited successfully",
        data: result
    })
})

const changeMemberRole = catchAsync(async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;


    const result = await workspaceService.changeMemberRole(userId as string, workspaceId as string, role as WorkspaceRole);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Member role changed successfully",
        data: result
    })
})

const removeWorkspaceMember = catchAsync(async (req, res) => {
    const { workspaceId, userId } = req.params;

    await workspaceService.removeWorkspaceMember(userId as string, workspaceId as string);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Member removed successfully",
        data: null
    })
})     
    


export const workspaceController = {
    createWorkspace,
    getMyWorkspaecs,
    getSingleWorkspace,
    inviteMember,
    changeMemberRole,
    removeWorkspaceMember
}