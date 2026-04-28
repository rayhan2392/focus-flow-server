import AppError from "../../error/AppError.js";
import bcrypt from 'bcrypt';
import { createUserTokens } from "../../utils/userToken.js";
import { prisma } from "../../../lib/prisma.js";


const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,       // JS cannot read this cookie — protects against XSS
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};




const register = async (payload: any) => {
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

    const accessToken = createUserTokens(user.id)
    const refreshToken = createUserTokens(user.id)
     


    return {
        user,
        accessToken,
        refreshToken
    }
    
}


export const authSevice = {
    register
}