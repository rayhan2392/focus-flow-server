import AppError from "../../error/AppError.js";
import bcrypt from 'bcrypt';
import { createUserTokens } from "../../utils/userToken.js";
import { prisma } from "../../../lib/prisma.js";
import { Response } from "express";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,       // JS cannot read this cookie — protects against XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};



const register = async (res: Response, payload: any) => {
    const { name, email, password } = payload
    const isEmailExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (isEmailExist) {
        throw new AppError(400, "Email already exist")
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const colors = ["#7F77DD", "#1D9E75", "#D85A30", "#BA7517", "#378ADD"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            avatarColor
        }
    })

    const userTokens = createUserTokens(user.id)

    res.cookie("refreshToken", userTokens.refreshToken, REFRESH_COOKIE_OPTIONS)




    return {
        user,
        accessToken: userTokens.accessToken,
    }

}

const login = async (res: Response, payload: any) => {
    const { email, password } = payload

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        throw new AppError(400, "Invalid credentials")
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
        throw new AppError(400, "Invalid credentials")
    }

    const userTokens = createUserTokens(user.id)

    res.cookie("refreshToken", userTokens.refreshToken, REFRESH_COOKIE_OPTIONS)

    return {
        user,
        accessToken: userTokens.accessToken,
    }
}


export const authSevice = {
    register,
    login
}