import { Provider, Role } from './../../../generated/prisma/enums';
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError.js";
import { jwtUtils } from "../../utils/jwtUtils.js";

import type { IGoogleUser, IRegisterUserPayload } from "./auth.interface";
import { googleClient } from "../../lib/googleAuth.js";
import type { TokenPayload } from "google-auth-library";
import type { SignOptions } from "jsonwebtoken";

const registerUserIntoDB = async (payload: IRegisterUserPayload) => {
	const { name, email, password, avatar, role } = payload;
	const existingUser = await prisma.uSER.findUnique({
		where: {
			email,
		},
	});
	if (existingUser) {
		throw new Error("User already exists");
	}
	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = await prisma.uSER.create({
		data: {
			name,
			email,
			avatar: avatar ?? null,
			provider: "LOCAL",
			role: Role.USER || Role.ORG_OWNER,
			password: hashedPassword,
		},
	});

	const user = await prisma.uSER.findUnique({
		where: {
			id: newUser.id,
			email: newUser.email || email,
		},
		omit: {
			password: true,
		},
	});
	return user;
};

const loginIntoDB = async (payload: { email: string; password: string }) => {
	const { email, password } = payload;
	const user = await prisma.uSER.findUnique({
		where: {
			email,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}
	const comparePassword = await bcrypt.compare(
		password,
		user.password as string,
	);
	if (!comparePassword) {
		throw new Error("Invalid password");
	}
	delete (user as any).password;
	const jwtPayload = user;
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		env.jwt_access_secret,
		env.jwt_access_expires_in,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		env.jwt_refresh_secret,
		env.jwt_refresh_expires_in,
	);

	return {
		user,
		accessToken,
		refreshToken,
	};
};

const getMyProfile = async (userId: string) => {
	const user = await prisma.uSER.findUnique({
		where: { id: userId },
		omit: { password: true },
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	return user;
};
const googleLogin = async (payload: IGoogleUser) => {
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: env.googleClientId,
		});
		googleIdTokenPayload = ticket.getPayload();
	} catch {
		throw new Error("Invalid or Expired Google Id Token");
	}
	if (!googleIdTokenPayload) {
		throw new Error("Invalid or Expired Google Id Token");
	}
	const ifUserExistWithGoogle = await prisma.uSER.findUnique({
		where: {
			email: googleIdTokenPayload.email as string,
			role: Role.USER,
			googleId: googleIdTokenPayload.sub,
			provider: Provider.GOOGLE
		},
	});
	let user = ifUserExistWithGoogle
	if (!user) {
		user = await prisma.uSER.create({
			data: {
				name: googleIdTokenPayload.name!,
				email: googleIdTokenPayload.email!,
				Role: Role.USER,
				googleId: googleIdTokenPayload.sub,
				provider: Provider.GOOGLE,
				isVerified: true,
				
			}
		})
	}
	const jwtPayload = user;
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		env.jwt_access_secret,
		env.jwt_access_expires_in,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		env.jwt_refresh_secret,
		env.jwt_refresh_expires_in,
	);

	return {
		user,
		accessToken,
		refreshToken,
	};
};
export const authService = {
	registerUserIntoDB,
	loginIntoDB,
	getMyProfile,
	googleLogin,
};
