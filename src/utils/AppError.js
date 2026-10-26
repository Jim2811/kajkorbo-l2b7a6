export class AppError extends Error {
    statusCode;
    code;
    errorDetails;
    constructor(statusCode, message, errorDetails = message) {
        super(message);
        this.statusCode = statusCode;
        this.code = getErrorCode(statusCode);
        this.errorDetails = errorDetails;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
const getErrorCode = (statusCode) => {
    const errorCodes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
    };
    return errorCodes[statusCode] ?? "INTERNAL_SERVER_ERROR";
};
//# sourceMappingURL=AppError.js.map