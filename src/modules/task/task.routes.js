import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { taskController } from "./task.controller.js";
import { createSubtaskValidationSchema, createTaskValidationSchema, reassignSubtaskValidationSchema, rejectTaskValidationSchema, requestSubtaskRevisionValidationSchema, reviewSubtaskValidationSchema, submitSubtaskValidationSchema, } from "./task.validation.js";
export const taskRouter = Router();
taskRouter.post("/", auth(Role.ORG_OWNER), validateRequest(createTaskValidationSchema), taskController.createTaskController);
taskRouter.post("/:taskId/accept", auth(Role.ORG_OWNER, Role.ORG_MEMBER, Role.TEAM_LEADER, Role.TEAM_MEMBER), taskController.acceptTaskController);
taskRouter.post("/:taskId/reject", auth(Role.ORG_OWNER, Role.ORG_MEMBER, Role.TEAM_LEADER, Role.TEAM_MEMBER), validateRequest(rejectTaskValidationSchema), taskController.rejectTaskController);
taskRouter.post("/:taskId/complete", auth(Role.ORG_MEMBER, Role.TEAM_LEADER), taskController.completeTaskController);
taskRouter.post("/:taskId/subtasks", auth(Role.ORG_OWNER, Role.ORG_MEMBER, Role.TEAM_LEADER, Role.TEAM_MEMBER), validateRequest(createSubtaskValidationSchema), taskController.createSubtaskController);
taskRouter.post("/subtasks/:subtaskId/submit", auth(Role.ORG_MEMBER, Role.TEAM_MEMBER, Role.TEAM_LEADER), validateRequest(submitSubtaskValidationSchema), taskController.submitSubtaskController);
taskRouter.post("/subtasks/:subtaskId/approve", auth(Role.ORG_MEMBER, Role.TEAM_LEADER), validateRequest(reviewSubtaskValidationSchema), taskController.approveSubtaskController);
taskRouter.post("/subtasks/:subtaskId/request-revision", auth(Role.ORG_MEMBER, Role.TEAM_LEADER), validateRequest(requestSubtaskRevisionValidationSchema), taskController.requestSubtaskRevisionController);
taskRouter.post("/subtasks/:subtaskId/reassign", auth(Role.ORG_MEMBER, Role.TEAM_LEADER), validateRequest(reassignSubtaskValidationSchema), taskController.reassignSubtaskController);
//# sourceMappingURL=task.routes.js.map