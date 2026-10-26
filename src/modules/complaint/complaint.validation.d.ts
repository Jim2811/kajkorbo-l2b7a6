import { z } from "zod";
export declare const createComplaintValidationSchema: z.ZodObject<{
    organizationId: z.ZodString;
    reportedUserId: z.ZodString;
    teamId: z.ZodOptional<z.ZodString>;
    taskId: z.ZodOptional<z.ZodString>;
    subtaskId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    description: z.ZodString;
    evidenceUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateComplaintStatusValidationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DISMISSED: "DISMISSED";
        OPEN: "OPEN";
        RESOLVED: "RESOLVED";
        UNDER_REVIEW: "UNDER_REVIEW";
    }>;
    resolutionNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const resolveComplaintValidationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DISMISSED: "DISMISSED";
        RESOLVED: "RESOLVED";
    }>;
    resolutionNotes: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=complaint.validation.d.ts.map