import { z } from "zod";
export declare const hireOrganizationMemberValidationSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const updateOrganizationValidationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    logo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createTeamValidationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addTeamMemberValidationSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const assignTeamLeaderValidationSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=organization.validation.d.ts.map