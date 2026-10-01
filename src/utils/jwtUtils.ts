import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, expiresIn: string) =>
	jwt.sign(payload, secret, {
		expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
	});

const verifyToken = (token: string, secret: string) => {
	try {
		return {
			success: true as const,
			data: jwt.verify(token, secret),
		};
	} catch (error) {
		return {
			success: false as const,
			error: error instanceof Error ? error.message : "Invalid token",
		};
	}
};

export const jwtUtils = {
	createToken,
	verifyToken,
};
