import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { billingController } from "./billing.controller.js";
import { createCheckoutValidationSchema } from "./billing.validation.js";
export const billingRouter = Router();
billingRouter.get("/organizations/:organizationId/team-capacity", auth(Role.ORG_OWNER), billingController.getTeamCapacityController);
billingRouter.post("/organizations/:organizationId/checkout", auth(Role.ORG_OWNER), validateRequest(createCheckoutValidationSchema), billingController.createCheckoutController);
billingRouter.get("/organizations/:organizationId/payments", auth(Role.ORG_OWNER), billingController.listPaymentsController);
billingRouter.post("/stripe/webhook", billingController.stripeWebhookController);
//# sourceMappingURL=billing.routes.js.map