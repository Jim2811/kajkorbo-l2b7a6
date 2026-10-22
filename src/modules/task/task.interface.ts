import type { TaskPriority } from "../../../generated/prisma/enums.js";

export interface ICreateTaskPayload {
	teamId: string;
	title: string;
	description: string;
	priority?: TaskPriority;
	startAt?: string;
	dueAt: string;
}

export interface IRejectTaskPayload {
	reason: string;
}
