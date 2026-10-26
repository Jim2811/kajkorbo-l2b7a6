import { z } from "zod";
export declare const registerValidationSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginValidationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const googleLoginValidationSchema: z.ZodObject<{
    idToken: z.ZodString;
}, z.core.$strip>;
export declare const verifyEmailValidationSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
}, z.core.$strip>;
export declare const updateProfileValidationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createOrganizationValidationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=auth.validation.d.ts.map