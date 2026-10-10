import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

export const validateRequest = (schema: ZodType) => {
	return (req: Request, _res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			throw new AppError(
				400,
				"Request validation failed",
				result.error.issues.map(
					({ path, message }) => `${path.join(".")}: ${message}`,
				),
			);
		}

		req.body = result.data;
		next();
	};
};
