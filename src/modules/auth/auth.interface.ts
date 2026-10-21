import type { Role } from "../../../generated/prisma/enums.js";

export interface IRegisterUserPayload {
	email: string;
	name: string;
	password: string;
	role?: Role;
	avatar?: string | undefined;
}

export interface IGoogleUser {
	idToken: string;
}
export interface IForgotPassword {
	email: string;
}

export interface IVerifyEmail {
	email: string;
	otp: string;
}

export interface IResetPassword {
	email: string;
	newPassword: string;
	otp: string;
}
