import type { ICreateOrganizationPayload } from "../auth/auth.interface.js";

export type { ICreateOrganizationPayload };

export interface IHireOrganizationMemberPayload {
	email: string;
}

export interface IUpdateOrganizationPayload {
	name?: string;
	description?: string;
	email?: string;
	phone?: string | null;
	address?: string | null;
	logo?: string | null;
}

export interface ICreateTeamPayload {
	name: string;
	description?: string;
}

export interface IAddTeamMemberPayload {
	userId: string;
}

export interface IAssignTeamLeaderPayload {
	userId: string;
}
