import { AppError } from "../utils/AppError.js";
export const validateRequest = (schema) => {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            throw new AppError(400, "Request validation failed", result.error.issues.map(({ path, message }) => `${path.join(".")}: ${message}`));
        }
        req.body = result.data;
        next();
    };
};
//# sourceMappingURL=validateRequest.js.map