import type Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums.js";
import type { ICreateCheckoutPayload } from "./billing.interface.js";
declare const createCheckoutSession: (organizationId: string, ownerId: string, payload: ICreateCheckoutPayload, idempotencyKey: string) => Promise<{
    paymentId: string;
    status: PaymentStatus;
    checkoutSessionId: string;
    checkoutUrl?: never;
} | {
    paymentId: string;
    status: PaymentStatus;
    checkoutSessionId: string;
    checkoutUrl: string;
}>;
declare const processWebhook: (event: Stripe.Event) => Promise<{
    duplicate: boolean;
}>;
declare const listPayments: (organizationId: string, ownerId: string) => Promise<{
    id: string;
    organizationId: string;
    stripePaymentIntentId: string | null;
    stripeCheckoutSessionId: string | null;
    idempotencyKey: string;
    amount: number;
    currency: string;
    purchasedTeamCapacity: number;
    status: PaymentStatus;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
declare const getTeamCapacity: (organizationId: string, ownerId: string) => Promise<{
    id: string;
    organizationId: string;
    freeTeamCapacity: number;
    purchasedTeamCapacity: number;
    usedTeamCapacity: number;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const billingService: {
    createCheckoutSession: typeof createCheckoutSession;
    processWebhook: typeof processWebhook;
    listPayments: typeof listPayments;
    getTeamCapacity: typeof getTeamCapacity;
};
export {};
//# sourceMappingURL=billing.service.d.ts.map