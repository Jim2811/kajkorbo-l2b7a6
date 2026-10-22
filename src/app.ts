import cookieParser from "cookie-parser";
import express from "express";
import { globalErrorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { billingRouter } from "./modules/billing/billing.routes.js";
import { complaintRouter } from "./modules/complaint/complaint.routes.js";
import { organizationRouter } from "./modules/organization/organization.routes.js";
import { taskRouter } from "./modules/task/task.routes.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

app.use(
	"/api/v1/billing/stripe/webhook",
	express.raw({ type: "application/json" }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/complaints", complaintRouter);

app.use((request, _response, next) => {
	next(
		new AppError(
			404,
			`Route not found: ${request.method} ${request.originalUrl}`,
		),
	);
});

app.use(globalErrorHandler);
