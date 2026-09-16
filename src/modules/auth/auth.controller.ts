import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";

const registerController = catchAsync(
	async (request: Request, response: Response) => {
		const result = await authService.registerUserIntoDB(request.body);
		sendResponse(response, {
			success: true,
			statusCode: 201,
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
			statusCode: 200,
			message: "User logged in successfully",
			data: result,
		});
	},
);

export const authController = {
	registerController,
	loginController,
};
