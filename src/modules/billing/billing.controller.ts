import type { Request, Response } from "express";
import httpStatus from "http-status";
import type Stripe from "stripe";
import { env } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { billingService } from "./billing.service.js";

const createCheckoutController = catchAsync(
	async (req: Request, res: Response) => {
		const idempotencyKey = req.header("Idempotency-Key");
		if (!idempotencyKey) {
			throw new AppError(400, "Idempotency-Key header is required");
		}

		const checkout = await billingService.createCheckoutSession(
			req.params.organizationId as string,
			req.user?.id as string,
			req.body,
			idempotencyKey,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Stripe checkout session created successfully",
			data: { checkout },
		});
	},
);

const listPaymentsController = catchAsync(
	async (req: Request, res: Response) => {
		const payments = await billingService.listPayments(
			req.params.organizationId as string,
			req.user?.id as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Payments fetched successfully",
			data: { payments },
		});
	},
);

const getTeamCapacityController = catchAsync(
	async (req: Request, res: Response) => {
		const entitlement = await billingService.getTeamCapacity(
			req.params.organizationId as string,
			req.user?.id as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Team capacity fetched successfully",
			data: { entitlement },
		});
	},
);

const stripeWebhookController = catchAsync(
	async (req: Request, res: Response) => {
		const signature = req.header("stripe-signature");
		if (!signature || !Buffer.isBuffer(req.body)) {
			throw new AppError(
				400,
				"Stripe signature and raw request body are required",
			);
		}

		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				signature,
				env.stripe.webhookSecret,
			);
		} catch {
			throw new AppError(400, "Invalid Stripe webhook signature");
		}

		const result = await billingService.processWebhook(event);

		return res.status(httpStatus.OK).json({
			received: true,
			duplicate: result.duplicate,
		});
	},
);

export const billingController = {
	createCheckoutController,
	listPaymentsController,
	getTeamCapacityController,
	stripeWebhookController,
};
