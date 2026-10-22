import { TaskStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	ICreateTaskPayload,
	IRejectTaskPayload,
} from "./task.interface.js";

const createTask = async (ownerId: string, payload: ICreateTaskPayload) => {
	const dueAt = new Date(payload.dueAt);
	const startAt = payload.startAt ? new Date(payload.startAt) : undefined;

	const team = await prisma.team.findFirst({
		where: {
			id: payload.teamId,
			status: "ACTIVE",
			deletedAt: null,
			organization: {
				ownerId,
				status: "ACTIVE",
				deletedAt: null,
			},
		},
		select: { id: true, organizationId: true },
	});

	if (!team) {
		throw new AppError(
			404,
			"Active team was not found in the owner's organization",
		);
	}

	return prisma.task.create({
		data: {
			organizationId: team.organizationId,
			teamId: team.id,
			creatorId: ownerId,
			title: payload.title,
			description: payload.description,
			...(payload.priority ? { priority: payload.priority } : {}),
			...(startAt ? { startAt } : {}),
			dueAt,
			status: TaskStatus.ASSIGNED,
		},
	});
};

const acceptTask = async (taskId: string, leaderId: string) => {
	const task = await prisma.task.findFirst({
		where: {
			id: taskId,
			status: TaskStatus.ASSIGNED,
			deletedAt: null,
			team: {
				status: "ACTIVE",
				deletedAt: null,
				leaderId,
				organization: { status: "ACTIVE", deletedAt: null },
			},
		},
		select: { id: true },
	});

	if (!task) {
		throw new AppError(
			404,
			"Assigned task was not found for this team's leader",
		);
	}

	return prisma.task.update({
		where: { id: task.id },
		data: {
			status: TaskStatus.ACCEPTED,
			rejectionReason: null,
		},
	});
};

const rejectTask = async (
	taskId: string,
	leaderId: string,
	payload: IRejectTaskPayload,
) => {
	const task = await prisma.task.findFirst({
		where: {
			id: taskId,
			status: TaskStatus.ASSIGNED,
			deletedAt: null,
			team: {
				status: "ACTIVE",
				deletedAt: null,
				leaderId,
				organization: { status: "ACTIVE", deletedAt: null },
			},
		},
		select: { id: true },
	});

	if (!task) {
		throw new AppError(
			404,
			"Assigned task was not found for this team's leader",
		);
	}

	return prisma.task.update({
		where: { id: task.id },
		data: {
			status: TaskStatus.REJECTED,
			rejectionReason: payload.reason,
		},
	});
};

export const taskService = {
	createTask,
	acceptTask,
	rejectTask,
};
