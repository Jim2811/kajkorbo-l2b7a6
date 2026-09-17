import express from "express";
import { globalErrorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRouter);

app.use((request, _response, next) => {
	next(
		new AppError(
			404,
			`Route not found: ${request.method} ${request.originalUrl}`,
		),
	);
});

app.use(globalErrorHandler);
