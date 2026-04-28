import { catchAsync } from "../../utils/catchAsync.js"
import { sendResponse } from "../../utils/sendResponse.js"
import { authSevice } from "./auth.service.js"


const register = catchAsync(async (req, res) => {
    const result = await authSevice.register(req.body)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User registered successfully",
        data: result
    })
})


export const authController = {
    register
}