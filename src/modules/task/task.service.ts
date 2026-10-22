import {
	SubtaskStatus,
	TaskStatus,
	TeamMemberStatus,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	ICreateSubtaskPayload,
	ICreateTaskPayload,
	IReassignSubtaskPayload,
	IRejectTaskPayload,
	IReviewSubtaskPayload,
	ISubmitSubtaskPayload,
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

const createSubtask = async (
	taskId: string,
	leaderId: string,
	payload: ICreateSubtaskPayload,
) => {
	return prisma.$transaction(async (transaction) => {
		const task = await transaction.task.findFirst({
			where: {
				id: taskId,
				status: {
					in: [TaskStatus.ACCEPTED, TaskStatus.IN_PROGRESS],
				},
				deletedAt: null,
				team: {
					status: "ACTIVE",
					deletedAt: null,
					leaderId,
					organization: { status: "ACTIVE", deletedAt: null },
				},
			},
			select: { id: true, teamId: true, dueAt: true, status: true },
		});

		if (!task) {
			throw new AppError(
				404,
				"Accepted task was not found for this team's leader",
			);
		}

		const assignedMember = await transaction.teamMember.findFirst({
			where: {
				teamId: task.teamId,
				userId: payload.assignedUserId,
				status: TeamMemberStatus.ACTIVE,
				deletedAt: null,
			},
			select: { userId: true },
		});

		if (!assignedMember || payload.assignedUserId === leaderId) {
			throw new AppError(
				409,
				"Subtasks must be assigned to an active team member other than the leader",
			);
		}

		const dueAt = new Date(payload.dueAt);
		if (dueAt > task.dueAt) {
			throw new AppError(
				400,
				"Subtask due date cannot exceed the task due date",
			);
		}

		const subtask = await transaction.subtask.create({
			data: {
				taskId,
				assignedUserId: payload.assignedUserId,
				title: payload.title,
				description: payload.description,
				dueAt,
				status: SubtaskStatus.ASSIGNED,
			},
		});

		if (task.status === TaskStatus.ACCEPTED) {
			await transaction.task.update({
				where: { id: task.id },
				data: { status: TaskStatus.IN_PROGRESS },
			});
		}

		return subtask;
	});
};

const submitSubtask = async (
	subtaskId: string,
	memberId: string,
	payload: ISubmitSubtaskPayload,
) => {
	return prisma.$transaction(async (transaction) => {
		const subtask = await transaction.subtask.findFirst({
			where: {
				id: subtaskId,
				assignedUserId: memberId,
				status: {
					in: [
						SubtaskStatus.ASSIGNED,
						SubtaskStatus.IN_PROGRESS,
						SubtaskStatus.REVISION_REQUIRED,
					],
				},
				deletedAt: null,
				task: {
					status: {
						in: [TaskStatus.ACCEPTED, TaskStatus.IN_PROGRESS],
					},
					deletedAt: null,
					team: {
						status: "ACTIVE",
						deletedAt: null,
						members: {
							some: {
								userId: memberId,
								status: TeamMemberStatus.ACTIVE,
								deletedAt: null,
							},
						},
						organization: { status: "ACTIVE", deletedAt: null },
					},
				},
			},
			select: { id: true },
		});

		if (!subtask) {
			throw new AppError(
				404,
				"Assigned subtask was not found for this organization member",
			);
		}

		const submission = await transaction.subtaskSubmission.create({
			data: {
				subtaskId,
				submittedById: memberId,
				description: payload.description,
			},
		});

		await transaction.subtask.update({
			where: { id: subtask.id },
			data: {
				status: SubtaskStatus.SUBMITTED,
				submittedAt: new Date(),
				reviewedAt: null,
			},
		});

		return submission;
	});
};

const reviewSubtask = async (
	subtaskId: string,
	leaderId: string,
	approved: boolean,
	payload: IReviewSubtaskPayload,
) => {
	return prisma.$transaction(async (transaction) => {
		const subtask = await transaction.subtask.findFirst({
			where: {
				id: subtaskId,
				status: SubtaskStatus.SUBMITTED,
				deletedAt: null,
				task: {
					deletedAt: null,
					team: {
						status: "ACTIVE",
						deletedAt: null,
						leaderId,
						organization: { status: "ACTIVE", deletedAt: null },
					},
				},
			},
			select: { id: true, assignedUserId: true },
		});

		if (!subtask) {
			throw new AppError(
				404,
				"Submitted subtask was not found for this team's leader",
			);
		}

		if (subtask.assignedUserId === leaderId) {
			throw new AppError(403, "A leader cannot review their own subtask");
		}

		const submission = await transaction.subtaskSubmission.findFirst({
			where: {
				subtaskId,
				reviewedAt: null,
			},
			orderBy: { submittedAt: "desc" },
		});

		if (!submission) {
			throw new AppError(409, "No pending submission is available for review");
		}

		const reviewedAt = new Date();
		await transaction.subtaskSubmission.update({
			where: { id: submission.id },
			data: {
				feedback: payload.feedback ?? null,
				reviewedById: leaderId,
				reviewedAt,
			},
		});

		return transaction.subtask.update({
			where: { id: subtask.id },
			data: {
				status: approved
					? SubtaskStatus.APPROVED
					: SubtaskStatus.REVISION_REQUIRED,
				reviewedAt,
			},
		});
	});
};

const reassignSubtask = async (
	subtaskId: string,
	leaderId: string,
	payload: IReassignSubtaskPayload,
) => {
	return prisma.$transaction(async (transaction) => {
		const subtask = await transaction.subtask.findFirst({
			where: {
				id: subtaskId,
				status: {
					notIn: [SubtaskStatus.APPROVED, SubtaskStatus.CANCELLED],
				},
				deletedAt: null,
				task: {
					deletedAt: null,
					team: {
						status: "ACTIVE",
						deletedAt: null,
						leaderId,
						organization: { status: "ACTIVE", deletedAt: null },
					},
				},
			},
			select: { id: true, taskId: true },
		});

		if (!subtask) {
			throw new AppError(
				404,
				"Reassignable subtask was not found for this team's leader",
			);
		}

		const teamMember = await transaction.teamMember.findFirst({
			where: {
				team: { tasks: { some: { id: subtask.taskId } } },
				userId: payload.assignedUserId,
				status: TeamMemberStatus.ACTIVE,
				deletedAt: null,
			},
			select: { id: true },
		});

		if (!teamMember || payload.assignedUserId === leaderId) {
			throw new AppError(
				409,
				"Subtasks must be assigned to an active team member other than the leader",
			);
		}

		return transaction.subtask.update({
			where: { id: subtask.id },
			data: {
				assignedUserId: payload.assignedUserId,
				status: SubtaskStatus.ASSIGNED,
				submittedAt: null,
				reviewedAt: null,
			},
		});
	});
};

export const taskService = {
	createTask,
	acceptTask,
	rejectTask,
	createSubtask,
	submitSubtask,
	reviewSubtask,
	reassignSubtask,
};
