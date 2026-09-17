// biome-ignore assist/source/organizeImports: <explanation>
import { AppError } from "../utils/AppError.js";
import httpStatus from "http-status";
import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (res.headersSent) {
		return next(error as Error);
	}

	const isAppError = error instanceof AppError;
	const statusCode = isAppError
		? error.statusCode
		: httpStatus.INTERNAL_SERVER_ERROR;
	const message =
		error instanceof Error ? error.message : "Something went wrong";
	const code = isAppError ? error.code : "INTERNAL_SERVER_ERROR";

	return res.status(statusCode).json({
		success: false,
		statusCode,
		error: { code, message },
		message,
		errorDetails: isAppError ? error.errorDetails : message,
	});
};
