import { AccountStatus, ComplaintStatus, OrganizationStatus, PaymentStatus, Role } from "../../../generated/prisma/enums.js";
declare const getDashboard: () => Promise<{
    overview: {
        users: number;
        organizations: number;
        teams: number;
        tasks: number;
        subtasks: number;
        complaints: number;
        payments: number;
        succeededRevenue: number;
    };
    usersByStatus: {
        [k: string]: number;
    };
    organizationsByStatus: {
        [k: string]: number;
    };
    tasksByStatus: {
        [k: string]: number;
    };
    complaintsByStatus: {
        [k: string]: number;
    };
    paymentsByStatus: {
        [k: string]: number;
    };
    recent: {
        organizations: {
            createdAt: Date;
            email: string;
            id: string;
            name: string;
            owner: {
                email: string;
                id: string;
                name: string;
            };
            plan: import("../../../generated/prisma/enums.js").PlanType;
            status: OrganizationStatus;
        }[];
        payments: {
            amount: number;
            createdAt: Date;
            currency: string;
            id: string;
            organization: {
                id: string;
                name: string;
            };
            organizationId: string;
            paidAt: Date | null;
            purchasedTeamCapacity: number;
            status: PaymentStatus;
        }[];
        complaints: {
            category: string;
            complainant: {
                id: string;
                name: string;
            };
            createdAt: Date;
            id: string;
            organization: {
                id: string;
                name: string;
            };
            organizationId: string;
            reportedUser: {
                id: string;
                name: string;
            };
            status: ComplaintStatus;
        }[];
    };
}>;
declare const listUsers: (query: {
    search?: string;
    status?: AccountStatus;
}) => Promise<{
    id: string;
    email: string;
    name: string;
    googleId: string | null;
    avatar: string | null;
    avatarPublicId: string | null;
    provider: import("../../../generated/prisma/enums.js").Provider;
    role: Role;
    status: AccountStatus;
    isVerified: boolean;
    bannedAt: Date | null;
    bannedReason: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}[]>;
declare const getUser: (userId: string) => Promise<{
    memberships: {
        organization: {
            id: string;
            name: string;
            status: OrganizationStatus;
        };
        organizationId: string;
        role: Role;
        status: import("../../../generated/prisma/enums.js").MemberStatus;
    }[];
    ownedOrganization: {
        id: string;
        name: string;
        status: OrganizationStatus;
    } | null;
} & {
    id: string;
    email: string;
    name: string;
    googleId: string | null;
    avatar: string | null;
    avatarPublicId: string | null;
    provider: import("../../../generated/prisma/enums.js").Provider;
    role: Role;
    status: AccountStatus;
    isVerified: boolean;
    bannedAt: Date | null;
    bannedReason: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}>;
declare const updateUserStatus: (userId: string, adminId: string, payload: {
    status: AccountStatus;
    bannedReason?: string;
}) => Promise<{
    id: string;
    email: string;
    name: string;
    googleId: string | null;
    avatar: string | null;
    avatarPublicId: string | null;
    provider: import("../../../generated/prisma/enums.js").Provider;
    role: Role;
    status: AccountStatus;
    isVerified: boolean;
    bannedAt: Date | null;
    bannedReason: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}>;
declare const listOrganizations: (query: {
    search?: string;
    status?: OrganizationStatus;
}) => Promise<({
    _count: {
        complaints: number;
        members: number;
        tasks: number;
        teams: number;
    };
    owner: {
        email: string;
        id: string;
        name: string;
        status: AccountStatus;
    };
} & {
    id: string;
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    logo: string | null;
    slug: string | null;
    ownerId: string;
    plan: import("../../../generated/prisma/enums.js").PlanType;
    status: OrganizationStatus;
    isSuspended: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
})[]>;
declare const getOrganization: (organizationId: string) => Promise<{
    _count: {
        complaints: number;
        members: number;
        payments: number;
        tasks: number;
        teams: number;
    };
    entitlement: {
        id: string;
        organizationId: string;
        freeTeamCapacity: number;
        purchasedTeamCapacity: number;
        usedTeamCapacity: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    owner: {
        email: string;
        id: string;
        name: string;
        status: AccountStatus;
    };
} & {
    id: string;
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    logo: string | null;
    slug: string | null;
    ownerId: string;
    plan: import("../../../generated/prisma/enums.js").PlanType;
    status: OrganizationStatus;
    isSuspended: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}>;
declare const updateOrganizationStatus: (organizationId: string, payload: {
    status: OrganizationStatus;
}) => Promise<{
    id: string;
    name: string;
    description: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    logo: string | null;
    slug: string | null;
    ownerId: string;
    plan: import("../../../generated/prisma/enums.js").PlanType;
    status: OrganizationStatus;
    isSuspended: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}>;
declare const listComplaints: (organizationId?: string) => Promise<({
    complainant: {
        email: string;
        id: string;
        name: string;
    };
    organization: {
        id: string;
        name: string;
    };
    reportedUser: {
        email: string;
        id: string;
        name: string;
    };
    reviewer: {
        email: string;
        id: string;
        name: string;
    } | null;
} & {
    id: string;
    organizationId: string;
    complainantId: string;
    reportedUserId: string;
    teamId: string | null;
    taskId: string | null;
    subtaskId: string | null;
    category: string;
    description: string;
    evidenceUrl: string | null;
    status: ComplaintStatus;
    reviewerId: string | null;
    resolutionNotes: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
declare const getComplaint: (complaintId: string) => Promise<{
    complainant: {
        email: string;
        id: string;
        name: string;
    };
    organization: {
        id: string;
        name: string;
    };
    reportedUser: {
        email: string;
        id: string;
        name: string;
    };
    reviewer: {
        email: string;
        id: string;
        name: string;
    } | null;
} & {
    id: string;
    organizationId: string;
    complainantId: string;
    reportedUserId: string;
    teamId: string | null;
    taskId: string | null;
    subtaskId: string | null;
    category: string;
    description: string;
    evidenceUrl: string | null;
    status: ComplaintStatus;
    reviewerId: string | null;
    resolutionNotes: string | null;
    resolvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
declare const listPayments: (organizationId?: string) => Promise<({
    organization: {
        email: string;
        id: string;
        name: string;
    };
} & {
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
})[]>;
declare const getPayment: (paymentId: string) => Promise<{
    organization: {
        email: string;
        id: string;
        name: string;
    };
} & {
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
}>;
export declare const superAdminService: {
    getDashboard: typeof getDashboard;
    listUsers: typeof listUsers;
    getUser: typeof getUser;
    updateUserStatus: typeof updateUserStatus;
    listOrganizations: typeof listOrganizations;
    getOrganization: typeof getOrganization;
    updateOrganizationStatus: typeof updateOrganizationStatus;
    listComplaints: typeof listComplaints;
    getComplaint: typeof getComplaint;
    listPayments: typeof listPayments;
    getPayment: typeof getPayment;
};
export {};
//# sourceMappingURL=super-admin.service.d.ts.map