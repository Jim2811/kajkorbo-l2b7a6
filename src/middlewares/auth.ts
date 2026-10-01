import { Role } from './../../generated/prisma/enums';
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";
import { jwtUtils } from "../utils/jwtUtils.js";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				name: string;
				role: Role;
				avatar: string | null;
				provider: string;
				isVerified: boolean;
			};
		}
	}
}

export const auth = (...requiredRoles: Role[]) =>
	catchAsync(
		async (request: Request, _response: Response, next: NextFunction) => {
			const token =
				request.cookies?.accessToken ??
				(request.headers.authorization?.startsWith("Bearer ")
					? request.headers.authorization.split(" ")[1]
					: request.headers.authorization);

			if (!token) {
				throw new AppError(
					401,
					"You are not logged in. Please log in to access this resource.",
				);
			}

			const verifiedToken = jwtUtils.verifyToken(token, env.jwt_access_secret);
			if (!verifiedToken.success) {
				throw new AppError(401, verifiedToken.error);
			}

			const { userId, id } = verifiedToken.data as JwtPayload & {
				userId?: string;
				id?: string;
			};
			const authenticatedUserId = userId ?? id;

			if (!authenticatedUserId) {
				throw new AppError(401, "Invalid authentication token");
			}

			const user = await prisma.uSER.findUnique({
				where: { id: authenticatedUserId },
			});

			if (!user) {
				throw new AppError(
					401,
					"The user belonging to this token no longer exists.",
				);
			}

			if (
				requiredRoles.length > 0 &&
				!requiredRoles.includes(user.role)
			) {
				throw new AppError(
					403,
					"Forbidden. You do not have permission to access this resource.",
				);
			}

			request.user = {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				avatar: user.avatar,
				provider: user.provider,
				isVerified: user.isVerified,
			};
			request.userId = user.id;
			next();
		},
	);
