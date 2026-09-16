import type { AccountType } from "../../../generated/prisma/enums.js";

export interface IUser {
	id: string;
	email: string;
	name: string;
	password: string;
	avatar?: string;
	provider?: string;
	accountType: AccountType;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}
