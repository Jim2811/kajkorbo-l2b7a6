import { z } from "zod";

export const hireOrganizationMemberValidationSchema = z.object({
	email: z.string().trim().email("A valid user email is required"),
});
