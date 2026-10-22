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
