import type { Request, Response } from "express";
import { login, register } from "./auth.service.js";

export const registerController = async (
	request: Request,
	response: Response,
) => {
	const result = await register(request.body);
	response.status(201).json({ success: true, data: result });
};

export const loginController = async (request: Request, response: Response) => {
	const result = await login(request.body);
	response.status(200).json({ success: true, data: result });
};
