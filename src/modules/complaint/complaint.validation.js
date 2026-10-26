import { z } from "zod";
export const createComplaintValidationSchema = z.object({
    organizationId: z.string().trim().min(1, "Organization ID is required"),
    reportedUserId: z.string().trim().min(1, "Reported user ID is required"),
    teamId: z.string().trim().min(1).optional(),
    taskId: z.string().trim().min(1).optional(),
    subtaskId: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1, "Complaint category is required"),
    description: z.string().trim().min(1, "Complaint description is required"),
    evidenceUrl: z.string().url("Evidence must be a valid URL").optional(),
});
export const updateComplaintStatusValidationSchema = z.object({
    status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]),
    resolutionNotes: z.string().trim().min(1).optional(),
});
export const resolveComplaintValidationSchema = z.object({
    status: z.enum(["RESOLVED", "DISMISSED"]),
    resolutionNotes: z.string().trim().min(1, "Resolution notes are required"),
});
//# sourceMappingURL=complaint.validation.js.map