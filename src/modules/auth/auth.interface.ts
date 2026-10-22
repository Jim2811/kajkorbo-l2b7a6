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

export interface IUpdateProfilePayload {
	name?: string;
}

export interface ICreateOrganizationPayload {
	name: string;
	description?: string;
	email: string;
	phone?: string;
	address?: string;
	logo?: string;
}
