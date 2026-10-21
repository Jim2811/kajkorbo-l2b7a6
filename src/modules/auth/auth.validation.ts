import { z } from "zod";

export const registerValidationSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("A valid email address is required"),
	password: z.string().min(6, "Password must be at least 6 characters long"),
	avatar: z.string().optional(),
});

export const loginValidationSchema = z.object({
	email: z.string().trim().email("A valid email address is required"),
	password: z.string().min(1, "Password is required"),
});

export const verifyEmailValidationSchema = z.object({
	email: z.string().trim().email("A valid email address is required"),
	otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number"),
});

export const updateProfileValidationSchema = z.object({
	name: z.string().trim().min(1, "Name cannot be empty").optional(),
});

export const createOrganizationValidationSchema = z.object({
	name: z.string().trim().min(1, "Organization name is required"),
	email: z.string().trim().email("A valid organization email is required"),
	phone: z.string().trim().min(1).optional(),
	address: z.string().trim().min(1).optional(),
});
