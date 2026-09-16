import express from "express";
import { globalErrorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";

export const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);

app.use((_request, response) => {
	response.status(404).json({
		success: false,
		error: { code: "NOT_FOUND", message: "Route not found" },
	});
});

app.use(globalErrorHandler);
