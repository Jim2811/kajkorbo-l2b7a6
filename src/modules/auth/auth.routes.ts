import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authController.registerController);
authRouter.post("/login", authController.loginController);
authRouter.post("/refresh-token", authController.refreshTokenController);
authRouter.get("/me", authenticate, authController.meController);
