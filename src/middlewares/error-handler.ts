import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

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
	const isMulterError = error instanceof multer.MulterError;
	const statusCode = isAppError
		? error.statusCode
		: isMulterError && error.code === "LIMIT_FILE_SIZE"
			? httpStatus.REQUEST_ENTITY_TOO_LARGE
			: httpStatus.INTERNAL_SERVER_ERROR;
	const message =
		isMulterError && error.code === "LIMIT_FILE_SIZE"
			? "Image size must not exceed 5 MB"
			: error instanceof Error
				? error.message
				: "Something went wrong";
	const code = isAppError ? error.code : "INTERNAL_SERVER_ERROR";

	return res.status(statusCode).json({
		success: false,
		statusCode,
		error: { code, message },
		message,
		errorDetails: isAppError ? error.errorDetails : message,
	});
};
