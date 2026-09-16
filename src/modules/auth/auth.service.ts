import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { AccountType, Provider } from "../../../generated/prisma/enums.js";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";

type AuthInput = {
	name?: unknown;
	email?: unknown;
	password?: unknown;
};

const parseCredentials = (input: AuthInput, requireName: boolean) => {
	const name = typeof input.name === "string" ? input.name.trim() : "";
	const email =
		typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
	const password = typeof input.password === "string" ? input.password : "";

	if ((requireName && name.length < 2) || !email || !password) {
		throw new AppError(
			requireName
				? "Name, email, and password are required"
				: "Email and password are required",
			400,
			"VALIDATION_ERROR",
		);
	}

	if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
		throw new AppError(
			"Use a valid email and a password of at least 8 characters",
			400,
			"VALIDATION_ERROR",
		);
	}

	return { name, email, password };
};

const publicUser = (user: {
	id: string;
	name: string;
	email: string;
	accountType: AccountType;
	isVerified: boolean;
}) => ({
	id: user.id,
	name: user.name,
	email: user.email,
	accountType: user.accountType,
	isVerified: user.isVerified,
});

const accessToken = (user: { id: string; accountType: AccountType }) =>
	jwt.sign({ sub: user.id, accountType: user.accountType }, env.jwtSecret, {
		expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
	} as SignOptions);

export const register = async (input: AuthInput) => {
	const credentials = parseCredentials(input, true);
	const existingUser = await prisma.uSER.findUnique({
		where: { email: credentials.email },
	});

	if (existingUser) {
		throw new AppError(
			"An account with this email already exists",
			409,
			"EMAIL_EXISTS",
		);
	}

	const password = await bcrypt.hash(credentials.password, 12);
	const user = await prisma.uSER.create({
		data: {
			name: credentials.name,
			email: credentials.email,
			password,
			provider: Provider.LOCAL,
			accountType: AccountType.USER,
		},
	});

	return { user: publicUser(user), accessToken: accessToken(user) };
};

export const login = async (input: AuthInput) => {
	const credentials = parseCredentials(input, false);
	const user = await prisma.uSER.findUnique({
		where: { email: credentials.email },
	});
	const passwordMatches = user?.password
		? await bcrypt.compare(credentials.password, user.password)
		: false;

	if (!user || !passwordMatches) {
		throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
	}

	return { user: publicUser(user), accessToken: accessToken(user) };
};
