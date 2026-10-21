import { Provider, Role } from "./../../../generated/prisma/enums";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma";
import redisClient from "../../lib/redis.js";
import { AppError } from "../../utils/AppError.js";
import { jwtUtils } from "../../utils/jwtUtils.js";
import { generateOtp } from "../../utils/otp.js";
import { sendPasswordResetOtp } from "../../lib/email.js";

import type {
	IForgotPassword,
	IGoogleUser,
	IRegisterUserPayload,
	IResetPassword,
} from "./auth.interface";
import { googleClient } from "../../lib/googleAuth.js";
import type { TokenPayload } from "google-auth-library";

const PASSWORD_RESET_OTP_TTL_SECONDS = 10 * 60;
const passwordResetOtpKey = (email: string) => `password-reset-otp:${email}`;

const registerUserIntoDB = async (payload: IRegisterUserPayload) => {
	const { name, email, password, avatar } = payload;
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
			role: Role.USER,
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
	if (!user.password) {
		throw new Error("This account does not have a password");
	}
	const comparePassword = await bcrypt.compare(password, user.password);
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
			provider: Provider.GOOGLE,
		},
	});
	let user = ifUserExistWithGoogle;
	if (!user) {
		user = await prisma.uSER.create({
			data: {
				name: googleIdTokenPayload.name!,
				email: googleIdTokenPayload.email!,
				role: Role.USER,
				googleId: googleIdTokenPayload.sub,
				provider: Provider.GOOGLE,
				isVerified: true,
			},
		});
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
const forgotPassword = async (payload: IForgotPassword) => {
	const { email } = payload;
	const isUserExists = await prisma.uSER.findUnique({
		where: {
			email,
		},
	});

	if (!isUserExists) {
		throw new AppError(404, "User not found");
	}

	const otp = generateOtp();
	await redisClient.set(passwordResetOtpKey(email), otp, {
		EX: PASSWORD_RESET_OTP_TTL_SECONDS,
	});
	await sendPasswordResetOtp(email, otp);

	return {
		message: "OTP sent successfully",
	};
};

const resetPassword = async (payload: IResetPassword) => {
	const { email, newPassword, otp } = payload;
	const storedOtp = await redisClient.get(passwordResetOtpKey(email));

	if (!storedOtp || storedOtp !== otp) {
		throw new AppError(400, "Invalid or expired OTP");
	}

	const user = await prisma.uSER.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);
	const updatedUser = await prisma.uSER.update({
		where: { id: user.id },
		data: { password: hashedPassword },
		omit: { password: true },
	});

	await redisClient.del(passwordResetOtpKey(email));

	return updatedUser;
};

export const authService = {
	registerUserIntoDB,
	loginIntoDB,
	getMyProfile,
	googleLogin,
	forgotPassword,
	resetPassword,
};
