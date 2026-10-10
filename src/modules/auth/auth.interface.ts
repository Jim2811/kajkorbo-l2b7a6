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
