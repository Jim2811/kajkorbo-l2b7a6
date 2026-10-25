import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createOrganizationValidationSchema } from "../auth/auth.validation.js";
import { organizationController } from "./organization.controller.js";
import {
	addTeamMemberValidationSchema,
	assignTeamLeaderValidationSchema,
	createTeamValidationSchema,
	hireOrganizationMemberValidationSchema,
	updateOrganizationValidationSchema,
} from "./organization.validation.js";

export const organizationRouter = Router();

organizationRouter.get(
	"/public",
	organizationController.listPublicOrganizationsController,
);

organizationRouter.post(
	"/",
	auth(Role.USER),
	validateRequest(createOrganizationValidationSchema),
	organizationController.createOrganizationController,
);

organizationRouter.post(
	"/:organizationId/members",
	auth(Role.ORG_OWNER),
	validateRequest(hireOrganizationMemberValidationSchema),
	organizationController.hireOrganizationMemberController,
);

organizationRouter.patch(
	"/:organizationId",
	auth(Role.ORG_OWNER),
	validateRequest(updateOrganizationValidationSchema),
	organizationController.updateOrganizationController,
);

organizationRouter.patch(
	"/:organizationId/deactivate",
	auth(Role.ORG_OWNER),
	organizationController.deactivateOrganizationController,
);

organizationRouter.delete(
	"/:organizationId",
	auth(Role.ORG_OWNER),
	organizationController.deactivateOrganizationController,
);

organizationRouter.post(
	"/:organizationId/teams",
	auth(Role.ORG_OWNER),
	validateRequest(createTeamValidationSchema),
	organizationController.createTeamController,
);

organizationRouter.delete(
	"/teams/:teamId",
	auth(Role.ORG_OWNER),
	organizationController.deleteTeamController,
);

organizationRouter.post(
	"/teams/:teamId/members",
	auth(Role.ORG_OWNER),
	validateRequest(addTeamMemberValidationSchema),
	organizationController.addTeamMemberController,
);

organizationRouter.delete(
	"/teams/:teamId/members/:userId",
	auth(Role.ORG_OWNER),
	organizationController.removeTeamMemberController,
);

organizationRouter.patch(
	"/teams/:teamId/leader",
	auth(Role.ORG_OWNER),
	validateRequest(assignTeamLeaderValidationSchema),
	organizationController.assignTeamLeaderController,
);
