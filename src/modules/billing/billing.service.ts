import type Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums.js";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { stripe } from "../../lib/stripe.js";
import { AppError } from "../../utils/AppError.js";
import type { ICreateCheckoutPayload } from "./billing.interface.js";

const createCheckoutSession = async (
	organizationId: string,
	ownerId: string,
	payload: ICreateCheckoutPayload,
	idempotencyKey: string,
) => {
	if (!idempotencyKey.trim()) {
		throw new AppError(400, "Idempotency-Key header is required");
	}

	const organization = await prisma.organization.findFirst({
		where: {
			id: organizationId,
			ownerId,
			status: "ACTIVE",
			deletedAt: null,
		},
		select: { id: true, name: true, email: true },
	});

	if (!organization) {
		throw new AppError(
			403,
			"Only the active organization owner can purchase capacity",
		);
	}

	const existingPayment = await prisma.payment.findUnique({
		where: { idempotencyKey },
		select: {
			id: true,
			status: true,
			stripeCheckoutSessionId: true,
		},
	});

	if (existingPayment) {
		if (!existingPayment.stripeCheckoutSessionId) {
			throw new AppError(
				409,
				"A checkout request with this key is already processing",
			);
		}

		return {
			paymentId: existingPayment.id,
			status: existingPayment.status,
			checkoutSessionId: existingPayment.stripeCheckoutSessionId,
		};
	}

	const amount =
		payload.additionalTeamCapacity * env.stripe.teamCapacityUnitAmount;
	const payment = await prisma.payment.create({
		data: {
			organizationId,
			idempotencyKey,
			amount,
			currency: env.stripe.currency,
			purchasedTeamCapacity: payload.additionalTeamCapacity,
			status: PaymentStatus.PENDING,
		},
	});

	try {
		const session = await stripe.checkout.sessions.create(
			{
				mode: "payment",
				customer_email: organization.email,
				line_items: [
					{
						price_data: {
							currency: env.stripe.currency,
							product_data: {
								name: `${payload.additionalTeamCapacity} additional team capacity`,
							},
							unit_amount: env.stripe.teamCapacityUnitAmount,
						},
						quantity: payload.additionalTeamCapacity,
					},
				],
				metadata: {
					paymentId: payment.id,
					organizationId,
					additionalTeamCapacity: String(payload.additionalTeamCapacity),
				},
				success_url: env.stripe.successUrl,
				cancel_url: env.stripe.cancelUrl,
			},
			{ idempotencyKey },
		);

		if (!session.url) {
			throw new AppError(502, "Stripe did not return a checkout URL");
		}

		const updatedPayment = await prisma.payment.update({
			where: { id: payment.id },
			data: { stripeCheckoutSessionId: session.id },
		});

		return {
			paymentId: updatedPayment.id,
			status: updatedPayment.status,
			checkoutSessionId: session.id,
			checkoutUrl: session.url,
		};
	} catch (error) {
		await prisma.payment.update({
			where: { id: payment.id },
			data: { status: PaymentStatus.FAILED },
		});

		throw error;
	}
};

const processWebhook = async (event: Stripe.Event) => {
	return prisma.$transaction(async (transaction) => {
		const existingEvent = await transaction.stripeWebhookEvent.findUnique({
			where: { id: event.id },
		});

		if (existingEvent) {
			return { duplicate: true };
		}

		await transaction.stripeWebhookEvent.create({
			data: { id: event.id, type: event.type },
		});

		if (
			event.type === "checkout.session.completed" ||
			event.type === "checkout.session.async_payment_succeeded"
		) {
			const session = event.data.object as Stripe.Checkout.Session;
			const paymentId = session.metadata?.paymentId;
			const organizationId = session.metadata?.organizationId;

			if (!paymentId || !organizationId) {
				throw new AppError(400, "Stripe checkout metadata is incomplete");
			}

			const payment = await transaction.payment.findUnique({
				where: { id: paymentId },
			});

			if (!payment || payment.organizationId !== organizationId) {
				throw new AppError(404, "Payment record was not found");
			}

			if (payment.status !== PaymentStatus.SUCCEEDED) {
				await transaction.payment.update({
					where: { id: payment.id },
					data: {
						status: PaymentStatus.SUCCEEDED,
						stripeCheckoutSessionId: session.id,
						stripePaymentIntentId:
							typeof session.payment_intent === "string"
								? session.payment_intent
								: null,
						paidAt: new Date(),
					},
				});

				await transaction.organizationEntitlement.update({
					where: { organizationId },
					data: {
						purchasedTeamCapacity: {
							increment: payment.purchasedTeamCapacity,
						},
					},
				});
			}
		}

		if (event.type === "checkout.session.async_payment_failed") {
			const session = event.data.object as Stripe.Checkout.Session;
			const paymentId = session.metadata?.paymentId;

			if (paymentId) {
				await transaction.payment.updateMany({
					where: { id: paymentId, status: PaymentStatus.PENDING },
					data: { status: PaymentStatus.FAILED },
				});
			}
		}

		if (event.type === "checkout.session.expired") {
			const session = event.data.object as Stripe.Checkout.Session;
			const paymentId = session.metadata?.paymentId;

			if (paymentId) {
				await transaction.payment.updateMany({
					where: { id: paymentId, status: PaymentStatus.PENDING },
					data: { status: PaymentStatus.CANCELLED },
				});
			}
		}

		if (
			event.type === "charge.refunded" ||
			event.type === "charge.dispute.created"
		) {
			const charge = event.data.object as Stripe.Charge;
			const paymentIntentId =
				typeof charge.payment_intent === "string"
					? charge.payment_intent
					: null;

			if (paymentIntentId) {
				const payment = await transaction.payment.findUnique({
					where: { stripePaymentIntentId: paymentIntentId },
					select: {
						id: true,
						organizationId: true,
						purchasedTeamCapacity: true,
					},
				});

				if (payment) {
					const status =
						event.type === "charge.refunded"
							? PaymentStatus.REFUNDED
							: PaymentStatus.DISPUTED;

					await transaction.payment.update({
						where: { id: payment.id },
						data: { status },
					});

					if (status === PaymentStatus.REFUNDED) {
						const entitlement =
							await transaction.organizationEntitlement.findUnique({
								where: { organizationId: payment.organizationId },
								select: { purchasedTeamCapacity: true },
							});

						if (entitlement) {
							await transaction.organizationEntitlement.update({
								where: { organizationId: payment.organizationId },
								data: {
									purchasedTeamCapacity: Math.max(
										0,
										entitlement.purchasedTeamCapacity -
											payment.purchasedTeamCapacity,
									),
								},
							});
						}
					}
				}
			}
		}

		return { duplicate: false };
	});
};

const listPayments = async (organizationId: string, ownerId: string) => {
	const organization = await prisma.organization.findFirst({
		where: { id: organizationId, ownerId, deletedAt: null },
		select: { id: true },
	});

	if (!organization) {
		throw new AppError(403, "Only the organization owner can view payments");
	}

	return prisma.payment.findMany({
		where: { organizationId },
		orderBy: { createdAt: "desc" },
	});
};

const getTeamCapacity = async (organizationId: string, ownerId: string) => {
	const organization = await prisma.organization.findFirst({
		where: { id: organizationId, ownerId, deletedAt: null },
		select: { id: true },
	});

	if (!organization) {
		throw new AppError(
			403,
			"Only the organization owner can view team capacity",
		);
	}

	return prisma.organizationEntitlement.findUnique({
		where: { organizationId },
	});
};

export const billingService = {
	createCheckoutSession,
	processWebhook,
	listPayments,
	getTeamCapacity,
};
