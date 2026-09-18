import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";

const registerController = catchAsync(
	async (request: Request, response: Response) => {
		const result = await authService.registerUserIntoDB(request.body);
		sendResponse(response, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "User registered successfully",
			data: result,
		});
	},
);

const loginController = catchAsync(
	async (request: Request, response: Response) => {
		const result = await authService.loginIntoDB(request.body);
		sendResponse(response, {
			success: true,
			statusCode: httpStatus.OK,
			message: "User logged in successfully",
			data: result,
		});
	},
);

const refreshTokenController = catchAsync(
	async (request: Request, response: Response) => {
		const result = await authService.refreshAccessToken(
			request.body.refreshToken,
		);
		sendResponse(response, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Access token refreshed successfully",
			data: result,
		});
	},
);

const meController = catchAsync(
	async (request: Request, response: Response) => {
		const result = await authService.getMyProfile(request.userId);
		sendResponse(response, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Profile retrieved successfully",
			data: result,
		});
	},
);

export const authController = {
	registerController,
	loginController,
	refreshTokenController,
	meController,
};
