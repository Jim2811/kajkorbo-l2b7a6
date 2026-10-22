import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { taskController } from "./task.controller.js";
import {
	createTaskValidationSchema,
	rejectTaskValidationSchema,
} from "./task.validation.js";

export const taskRouter = Router();

taskRouter.post(
	"/",
	auth(Role.ORG_OWNER),
	validateRequest(createTaskValidationSchema),
	taskController.createTaskController,
);

taskRouter.post(
	"/:taskId/accept",
	auth(Role.ORG_OWNER, Role.ORG_MEMBER, Role.TEAM_LEADER, Role.TEAM_MEMBER),
	taskController.acceptTaskController,
);

taskRouter.post(
	"/:taskId/reject",
	auth(Role.ORG_OWNER, Role.ORG_MEMBER, Role.TEAM_LEADER, Role.TEAM_MEMBER),
	validateRequest(rejectTaskValidationSchema),
	taskController.rejectTaskController,
);
