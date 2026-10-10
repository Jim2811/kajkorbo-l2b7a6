import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";

const registerController = catchAsync(async (req: Request, res: Response) => {
	const user = await authService.registerUserIntoDB(req.body);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User registered successfully!",
		data: { user },
	});
});

const loginController = catchAsync(async (req: Request, res: Response) => {
	const { user, accessToken, refreshToken } = await authService.loginIntoDB(
		req.body,
	);
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

const meController = catchAsync(async (req: Request, res: Response) => {
	const profile = await authService.getMyProfile(req.user?.id as string);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Profile retrieved successfully",
		data: { profile },
	});
});
const googleLoginController = catchAsync(
	async (req: Request, res: Response) => {
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
	},
);
export const authController = {
	registerController,
	loginController,
	meController,
	googleLoginController,
};
