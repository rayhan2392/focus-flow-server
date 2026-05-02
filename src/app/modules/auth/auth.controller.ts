import { create } from "node:domain"
import { prisma } from "../../../lib/prisma.js"
import { envVars } from "../../config/env.js"
import AppError from "../../error/AppError.js"
import { catchAsync } from "../../utils/catchAsync.js"
import { verifyToken } from "../../utils/jwt.js"
import { sendResponse } from "../../utils/sendResponse.js"
import { authSevice } from "./auth.service.js"
import { createUserTokens } from "../../utils/userToken.js"



const register = catchAsync(async (req, res) => {
    const result = await authSevice.register(res, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: result
    })
})

const login = catchAsync(async (req, res) => {
    const result = await authSevice.login(res, req.body)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User logged in successfully",
        data: result
    })
})

const refresh = catchAsync(async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        throw new AppError(401, "No refresh token provided")
    }

    const payload = verifyToken(token, envVars.JWT_REFRESH_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
        throw new AppError(404, "User not found");
    }
    const accessToken = createUserTokens(user.id).accessToken
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken }
    })
})

const logout = catchAsync(async (req, res) => {
    res.clearCookie("refreshToken");
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Logged out successfully",
        data: null
    })
})

const getMe = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError(401, "Unauthorized")
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User info retrieved successfully",
        data: req.user
    })
})

export const authController = {
    register,
    login,
    refresh,
    logout,
    getMe
}
