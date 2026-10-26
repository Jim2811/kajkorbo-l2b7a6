export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR") {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
    }
}
//# sourceMappingURL=app-error.js.map