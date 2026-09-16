import { Router } from "express";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authController.registerController);
// authRouter.post("/login", authController.loginController);
