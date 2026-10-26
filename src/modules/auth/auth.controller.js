import httpStatus from "http-status";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";
const registerController = catchAsync(async (req, res) => {
    const user = await authService.registerUserIntoDB(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully. Please verify your email.",
        data: { user },
    });
});
const verifyEmailController = catchAsync(async (req, res) => {
    const user = await authService.verifyEmail(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email verified successfully. Welcome to Kajkorbo!",
        data: { user },
    });
});
const loginController = catchAsync(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.loginIntoDB(req.body);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully!",
        data: { user, accessToken, refreshToken },
    });
});
const meController = catchAsync(async (req, res) => {
    const profile = await authService.getMyProfile(req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile retrieved successfully",
        data: { profile },
    });
});
const updateProfileController = catchAsync(async (req, res) => {
    const user = await authService.updateProfile(req.user?.id, req.body, req.file);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile updated successfully",
        data: { user },
    });
});
const uploadAvatarController = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new AppError(400, "An image file is required");
    }
    const user = await authService.uploadAvatar(req.user?.id, req.file);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Avatar uploaded successfully",
        data: { user },
    });
});
const googleLoginController = catchAsync(async (req, res) => {
    const payload = req.body;
    const result = await authService.googleLogin(payload);
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24,
    });
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Logged in successfully!",
        data: { result },
    });
});
const forgotPassController = catchAsync(async (req, res) => {
    const result = await authService.forgotPassword(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: {},
    });
});
const resetPassController = catchAsync(async (req, res) => {
    await authService.resetPassword(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully!",
        data: {},
    });
});
export const authController = {
    registerController,
    verifyEmailController,
    loginController,
    meController,
    updateProfileController,
    uploadAvatarController,
    googleLoginController,
    forgotPassController,
    resetPassController,
};
//# sourceMappingURL=auth.controller.js.map