import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

import type { IUser } from "./auth.interface";
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

	return newUser;
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
	const isPasswordValid = await bcrypt.compare(password, existingUser.password as string);
	if (!isPasswordValid) {
		throw new Error("Invalid password");
	}
	return existingUser;
}
export const authService = {
	registerUserIntoDB,
	loginIntoDB,
};
