import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { globalErrorHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { billingRouter } from "./modules/billing/billing.routes.js";
import { complaintRouter } from "./modules/complaint/complaint.routes.js";
import { organizationRouter } from "./modules/organization/organization.routes.js";
import { superAdminRouter } from "./modules/super-admin/super-admin.routes.js";
import { taskRouter } from "./modules/task/task.routes.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || env.frontendOrigins.includes(origin)) {
				callback(null, true);
				return;
			}

			callback(new Error("Origin is not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
	}),
);

app.get("/", (_request, response) => {
	response.status(200).json({
		success: true,
		statusCode: 200,
		message: "Kajkorbo API is running",
		data: {
			apiVersion: "v1",
			health: "/health",
		},
	});
});

app.get("/health", (_request, response) => {
	response.status(200).json({
		success: true,
		statusCode: 200,
		message: "Kajkorbo API is healthy",
		data: {},
	});
});

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
app.use("/api/v1/super-admin", superAdminRouter);

app.use((request, _response, next) => {
	next(
		new AppError(
			404,
			`Route not found: ${request.method} ${request.originalUrl}`,
		),
	);
});

app.use(globalErrorHandler);
