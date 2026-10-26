import { z } from "zod";
export const updateUserStatusValidationSchema = z.object({
    status: z.enum(["ACTIVE", "BANNED", "DEACTIVATED"]),
    bannedReason: z.string().trim().min(1).optional(),
});
export const updateOrganizationStatusValidationSchema = z.object({
    status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED"]),
});
//# sourceMappingURL=super-admin.validation.js.map