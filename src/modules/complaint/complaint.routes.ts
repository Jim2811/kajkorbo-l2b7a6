import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { complaintController } from "./complaint.controller.js";
import {
	createComplaintValidationSchema,
	resolveComplaintValidationSchema,
	updateComplaintStatusValidationSchema,
} from "./complaint.validation.js";

export const complaintRouter = Router();

complaintRouter.post(
	"/",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	validateRequest(createComplaintValidationSchema),
	complaintController.createComplaintController,
);

complaintRouter.get(
	"/",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	complaintController.listComplaintsController,
);

complaintRouter.get(
	"/:complaintId",
	auth(
		Role.SUPER_ADMIN,
		Role.ORG_OWNER,
		Role.ORG_MEMBER,
		Role.TEAM_LEADER,
		Role.TEAM_MEMBER,
		Role.USER,
	),
	complaintController.getComplaintController,
);

complaintRouter.patch(
	"/:complaintId/status",
	auth(Role.SUPER_ADMIN, Role.ORG_OWNER),
	validateRequest(updateComplaintStatusValidationSchema),
	complaintController.updateComplaintStatusController,
);

complaintRouter.post(
	"/:complaintId/resolve",
	auth(Role.SUPER_ADMIN, Role.ORG_OWNER),
	validateRequest(resolveComplaintValidationSchema),
	complaintController.resolveComplaintController,
);
