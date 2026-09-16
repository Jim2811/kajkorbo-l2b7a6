import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const globalErrorHandler: ErrorRequestHandler = (
	error,
	_request,
	response,
	_next,
) => {
	if (error instanceof AppError) {
		response.status(error.statusCode).json({
			success: false,
			error: { code: error.code, message: error.message },
		});
		return;
	}

	if (error?.code === "P2002") {
		response.status(409).json({
			success: false,
			error: {
				code: "CONFLICT",
				message: "An account with this email already exists",
			},
		});
		return;
	}

	console.error(error);
	response.status(500).json({
		success: false,
		error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
	});
};
