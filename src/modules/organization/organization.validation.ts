import { z } from "zod";

export const hireOrganizationMemberValidationSchema = z.object({
	email: z.string().trim().email("A valid user email is required"),
});

export const updateOrganizationValidationSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Organization name cannot be empty")
			.optional(),
		description: z.string().trim().min(1).optional(),
		email: z
			.string()
			.trim()
			.email("A valid organization email is required")
			.optional(),
		phone: z.string().trim().min(1).nullable().optional(),
		address: z.string().trim().min(1).nullable().optional(),
		logo: z.string().trim().min(1).nullable().optional(),
	})
	.refine((payload) => Object.keys(payload).length > 0, {
		message: "At least one organization field is required",
	});
