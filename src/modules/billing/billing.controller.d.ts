import type { Request, Response } from "express";
export declare const billingController: {
    createCheckoutController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    listPaymentsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getTeamCapacityController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    stripeWebhookController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=billing.controller.d.ts.map