import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authController } from "./auth.controller.js";
import {
	loginValidationSchema,
	registerValidationSchema,
	verifyEmailValidationSchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
	"/register",
	validateRequest(registerValidationSchema),
	authController.registerController,
);
authRouter.post(
	"/verify-email",
	validateRequest(verifyEmailValidationSchema),
	authController.verifyEmailController,
);
authRouter.post(
	"/login",
	validateRequest(loginValidationSchema),
	authController.loginController,
);
authRouter.get(
	"/me",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	authController.meController,
);
authRouter.post("/google", authController.googleLoginController);

authRouter.post("/reset-password", authController.resetPassController);
authRouter.post("/forgot-password", authController.forgotPassController);
