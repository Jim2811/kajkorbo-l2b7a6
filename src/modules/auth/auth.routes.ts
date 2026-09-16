import { Router } from "express";
import { loginController, registerController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
