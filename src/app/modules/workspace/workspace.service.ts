import { Request } from "express";
import { prisma } from "../../../lib/prisma.js";
import AppError from "../../error/AppError.js";
import { WorkspaceRole } from "../../../generated/client/enums.js";


const slugify = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");



const createWorkspace = async (req: Request, name: string) => {
    let slug = slugify(name);
    const existing = await prisma.workspace.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`;

    const workspace = await prisma.workspace.create({
        data: {
            name,
            slug,
            members: {
                create: {
                    userId: req.user!.id,
                    role: "ADMIN", // creator is always admin
                },
            },
        },
        include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });

    return workspace;

}

const getMyWorkspaces = async (req: Request) => {
    const workspaces = await prisma.workspace.findMany({
        where: {
            members:
                { some: { userId: req.user!.id } }
        },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } }
            },
            _count: { select: { projects: true } },
        },
    });

    return workspaces;
}

const getSingleWorkspace = async (workspaceId: string) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            members: {
                include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } }
            },
            projects: true
        },
    });

    if (!workspace) {
        throw new AppError(404, "Workspace not found");
    }

    return workspace;
}

const inviteMember = async (email: string, workspaceId: string) => {
    //find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError(404, "User not found");
    }
    //check if the user is already a member of the workspace
    const existing = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: user.id, workspaceId } },
    });

    if (existing) {
        throw new AppError(400, "User is already a member of the workspace");
    }

    const member = await prisma.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId,
            role: "MEMBER"
        },
        include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } }
    })

    return member;

}

const changeMemberRole = async (userId: string, workspaceId: string, role: WorkspaceRole) => {
    const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!membership) {
        throw new AppError(404, "Membership not found");
    }

    const updated = await prisma.workspaceMember.update({
        where: { userId_workspaceId: { userId, workspaceId } },
        data: { role }
    })

    return updated;
}

const removeWorkspaceMember = async (userId: string, workspaceId: string) => {
    const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!membership) {
        throw new AppError(404, "Membership not found");
    }

    await prisma.workspaceMember.delete({
        where: { userId_workspaceId: { userId, workspaceId } },
    })

    return;
}

export const workspaceService = {
    createWorkspace,
    getMyWorkspaces,
    getSingleWorkspace,
    inviteMember,
    changeMemberRole,
    removeWorkspaceMember
}