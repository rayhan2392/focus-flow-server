import { envVars } from "../config/env.js";
import { generateToken } from "./jwt.js";





export const createUserTokens = (userId: string) => {


    const accessToken = generateToken(
        { userId },
        envVars.JWT_SECRET,
        envVars.JWT_EXPIRES_IN
    );

    const refreshToken = generateToken(
        { userId },
        envVars.JWT_REFRESH_SECRET,
        envVars.JWT_REFRESH_EXPIRES_IN
    );

    return {
        accessToken,
        refreshToken,
    };
};

