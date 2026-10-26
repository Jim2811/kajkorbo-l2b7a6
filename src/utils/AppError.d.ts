export declare class AppError extends Error {
    statusCode: number;
    code: string;
    errorDetails: string | string[] | Record<string, unknown>;
    constructor(statusCode: number, message: string, errorDetails?: string | string[] | Record<string, unknown>);
}
//# sourceMappingURL=AppError.d.ts.map