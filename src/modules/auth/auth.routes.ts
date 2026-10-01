import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);
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
