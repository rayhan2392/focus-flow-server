import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { projectService } from "./project.service.js";

const getProjects = catchAsync(async (req, res) => {
    const workspaceId = req.params.workspaceId as string;
    const projects = await projectService.getProjects(workspaceId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Projects retrieved successfully",
        data: projects
    });
});

const createProject = catchAsync(async (req, res) => {

    const workspaceId = req.params.workspaceId as string;
    const project = await projectService.createProject(workspaceId, req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Project created successfully",
        data: project
    });
});

const updateProject = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;
    const project = await projectService.updateProject(projectId, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Project updated successfully",
        data: project
    });
});

const deleteProject = catchAsync(async (req, res) => {
    const projectId = req.params.projectId as string;
    await projectService.deleteProject(projectId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Project deleted successfully",
        data:null
    });
});
    

export const projectController = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
}