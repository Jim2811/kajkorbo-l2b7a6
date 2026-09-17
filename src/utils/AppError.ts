export class AppError extends Error {
	statusCode: number;
	code: string;
	errorDetails: string | string[] | Record<string, unknown>;

	constructor(
		statusCode: number,
		message: string,
		errorDetails: string | string[] | Record<string, unknown> = message,
	) {
		super(message);
		this.statusCode = statusCode;
		this.code = getErrorCode(statusCode);
		this.errorDetails = errorDetails;
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

const getErrorCode = (statusCode: number) => {
	const errorCodes: Record<number, string> = {
		400: "BAD_REQUEST",
		401: "UNAUTHORIZED",
		403: "FORBIDDEN",
		404: "NOT_FOUND",
		409: "CONFLICT",
	};

	return errorCodes[statusCode] ?? "INTERNAL_SERVER_ERROR";
};
