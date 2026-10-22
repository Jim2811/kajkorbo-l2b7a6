import { z } from "zod";

const dateString = z.string().datetime({
	message: "A valid ISO date-time is required",
});

export const createTaskValidationSchema = z
	.object({
		teamId: z.string().trim().min(1, "Team ID is required"),
		title: z.string().trim().min(1, "Task title is required"),
		description: z.string().trim().min(1, "Task description is required"),
		priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
		startAt: dateString.optional(),
		dueAt: dateString,
	})
	.refine(
		({ startAt, dueAt }) =>
			!startAt || new Date(startAt).getTime() < new Date(dueAt).getTime(),
		{
			message: "Start date must be before the due date",
			path: ["startAt"],
		},
	);

export const rejectTaskValidationSchema = z.object({
	reason: z.string().trim().min(1, "A rejection reason is required"),
});

export const createSubtaskValidationSchema = z
	.object({
		assignedUserId: z.string().trim().min(1, "Assigned user ID is required"),
		title: z.string().trim().min(1, "Subtask title is required"),
		description: z.string().trim().min(1, "Subtask description is required"),
		dueAt: dateString,
	})
	.refine(({ dueAt }) => new Date(dueAt).getTime() > Date.now(), {
		message: "Subtask due date must be in the future",
		path: ["dueAt"],
	});

export const submitSubtaskValidationSchema = z.object({
	description: z.string().trim().min(1, "Submission description is required"),
});

export const reviewSubtaskValidationSchema = z.object({
	feedback: z.string().trim().min(1).optional(),
});

export const requestSubtaskRevisionValidationSchema = z.object({
	feedback: z.string().trim().min(1, "Revision feedback is required"),
});

export const reassignSubtaskValidationSchema = z.object({
	assignedUserId: z.string().trim().min(1, "Assigned user ID is required"),
});
