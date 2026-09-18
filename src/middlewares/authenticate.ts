import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

type AccessTokenPayload = jwt.JwtPayload & {
	userId: string;
};

export const authenticate = (
	request: Request,
	_response: Response,
	next: NextFunction,
) => {
	const authorization = request.headers.authorization;
	const [scheme, token] = authorization?.split(" ") ?? [];

	if (scheme !== "Bearer" || !token) {
		return next(new AppError(401, "Authentication token is required"));
	}

	try {
		const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;

		if (!payload.userId) {
			return next(new AppError(401, "Invalid authentication token"));
		}

		request.userId = payload.userId;
		return next();
	} catch {
		return next(new AppError(401, "Invalid or expired authentication token"));
	}
};
