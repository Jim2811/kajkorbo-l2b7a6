import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createOrganizationValidationSchema } from "../auth/auth.validation.js";
import { organizationController } from "./organization.controller.js";

export const organizationRouter = Router();

organizationRouter.post(
	"/",
	auth(Role.USER, Role.ORG_OWNER),
	validateRequest(createOrganizationValidationSchema),
	organizationController.createOrganizationController,
);
