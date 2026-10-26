import { z } from "zod";
export declare const updateUserStatusValidationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        BANNED: "BANNED";
        DEACTIVATED: "DEACTIVATED";
    }>;
    bannedReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateOrganizationStatusValidationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DEACTIVATED: "DEACTIVATED";
        SUSPENDED: "SUSPENDED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=super-admin.validation.d.ts.map