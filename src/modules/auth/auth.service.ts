import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError.js";

import type { IUser } from "./auth.interface";

type TokenPayload = {
	userId: string;
};

const getTokenOptions = (expiresIn: string): SignOptions => ({
	expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]>,
});

const createAccessToken = (user: {
	id: string;
	email: string;
	accountType: string;
}) =>
	jwt.sign(
		{ userId: user.id, email: user.email, accountType: user.accountType },
		env.jwtSecret,
		getTokenOptions(env.jwtExpiresIn),
	);

const createRefreshToken = (userId: string) =>
	jwt.sign({ userId }, env.jwtSecret, getTokenOptions(env.jwtRefreshExpiresIn));

const getSafeUser = (user: {
	id: string;
	email: string;
	name: string;
	avatar: string | null;
	provider: string;
	accountType: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date | null;
}) => ({
	id: user.id,
	email: user.email,
	name: user.name,
	avatar: user.avatar,
	provider: user.provider,
	accountType: user.accountType,
	isVerified: user.isVerified,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const registerUserIntoDB = async (payload: IUser) => {
	const { name, email, avatar, accountType } = payload;
	const existingUser = await prisma.uSER.findUnique({
		where: {
			email,
		},
	});
	if (existingUser) {
		throw new Error("User already exists");
	}
	const hashedPassword = await bcrypt.hash(payload.password, 10);
	const newUser = await prisma.uSER.create({
		data: {
			name,
			email,
			avatar: avatar ?? null,
			provider: "LOCAL",
			accountType,
			password: hashedPassword,
		},
	});

	return getSafeUser(newUser);
};

const loginIntoDB = async (payload: { email: string; password: string }) => {
	const { email, password } = payload;
	const existingUser = await prisma.uSER.findUnique({
		where: {
			email,
		},
	});
	if (!existingUser) {
		throw new Error("User does not exist");
	}
	const isPasswordValid = await bcrypt.compare(
		password,
		existingUser.password as string,
	);
	if (!isPasswordValid) {
		throw new Error("Invalid password");
	}
	return {
		user: getSafeUser(existingUser),
		accessToken: createAccessToken(existingUser),
		refreshToken: createRefreshToken(existingUser.id),
	};
};

const refreshAccessToken = async (refreshToken: string) => {
	try {
		const payload = jwt.verify(refreshToken, env.jwtSecret) as TokenPayload;
		const user = await prisma.uSER.findUnique({
			where: { id: payload.userId },
		});

		if (!user) {
			throw new AppError(401, "User not found");
		}

		return { accessToken: createAccessToken(user) };
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError(401, "Invalid or expired refresh token");
	}
};
export const authService = {
	registerUserIntoDB,
	loginIntoDB,
	refreshAccessToken,
};
