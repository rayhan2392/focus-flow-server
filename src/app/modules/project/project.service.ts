
import { prisma } from "../../../lib/prisma.js";

const getProjects = async (workspaceId: string) => {

    const projects = await prisma.project.findMany({
        where: { workspaceId },
        include: {
            _count : {
                select: { standups: true, goals: true}
            }
        },
        orderBy: { createdAt: "asc" }
    });

    return projects;
}

const createProject = async (workspaceId: string, payload: { name: string; description: string }) => {
    const {name, description} = payload;
    const project = await prisma.project.create({
        data: {
            name,
            description,
            workspaceId
        }
    });

    return project;
}

//update project just name and description,
const updateProject = async (projectId: string, payload: { name?: string; description?: string }) => {
    const {name, description} = payload;
    const project = await prisma.project.update({
        where: { id: projectId },
        data: {
            name,
            description
        }
    });

    return project;
}

const deleteProject = async (projectId: string) => {
    await prisma.project.delete({
        where: { id: projectId }
    });
    return;
}

export const projectService = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
}

