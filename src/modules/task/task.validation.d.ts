import { z } from "zod";
export declare const createTaskValidationSchema: z.ZodObject<{
    teamId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodOptional<z.ZodEnum<{
        HIGH: "HIGH";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        URGENT: "URGENT";
    }>>;
    startAt: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodString;
}, z.core.$strip>;
export declare const rejectTaskValidationSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const createSubtaskValidationSchema: z.ZodObject<{
    assignedUserId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    dueAt: z.ZodString;
}, z.core.$strip>;
export declare const submitSubtaskValidationSchema: z.ZodObject<{
    description: z.ZodString;
}, z.core.$strip>;
export declare const reviewSubtaskValidationSchema: z.ZodObject<{
    feedback: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const requestSubtaskRevisionValidationSchema: z.ZodObject<{
    feedback: z.ZodString;
}, z.core.$strip>;
export declare const reassignSubtaskValidationSchema: z.ZodObject<{
    assignedUserId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=task.validation.d.ts.map