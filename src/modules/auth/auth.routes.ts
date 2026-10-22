import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { imageUpload } from "../../middlewares/upload.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authController } from "./auth.controller.js";
import {
	loginValidationSchema,
	registerValidationSchema,
	updateProfileValidationSchema,
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
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	authController.meController,
);
authRouter.patch(
	"/profile",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	imageUpload.single("avatar"),
	validateRequest(updateProfileValidationSchema),
	authController.updateProfileController,
);
authRouter.post(
	"/avatar",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	imageUpload.single("avatar"),
	authController.uploadAvatarController,
);
authRouter.post("/google", authController.googleLoginController);

authRouter.post("/reset-password", authController.resetPassController);
authRouter.post("/forgot-password", authController.forgotPassController);
