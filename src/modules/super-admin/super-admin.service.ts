import {
	AccountStatus,
	ComplaintStatus,
	OrganizationStatus,
	PaymentStatus,
	Role,
	TaskStatus,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

const countByEnum = <T extends string>(
	values: readonly T[],
	rows: Array<{ _count: { _all: number }; [key: string]: unknown }>,
	key: string,
) =>
	Object.fromEntries(
		values.map((value) => [
			value,
			rows.find((row) => row[key] === value)?._count._all ?? 0,
		]),
	);

const getDashboard = async () => {
	const [
		userCount,
		organizationCount,
		teamCount,
		taskCount,
		subtaskCount,
		complaintCount,
		paymentCount,
		revenue,
		usersByStatus,
		organizationsByStatus,
		tasksByStatus,
		complaintsByStatus,
		paymentsByStatus,
		recentOrganizations,
		recentPayments,
		recentComplaints,
	] = await Promise.all([
		prisma.uSER.count({ where: { deletedAt: null } }),
		prisma.organization.count({ where: { deletedAt: null } }),
		prisma.team.count({ where: { deletedAt: null } }),
		prisma.task.count({ where: { deletedAt: null } }),
		prisma.subtask.count({ where: { deletedAt: null } }),
		prisma.complaint.count(),
		prisma.payment.count(),
		prisma.payment.aggregate({
			where: { status: PaymentStatus.SUCCEEDED },
			_sum: { amount: true },
		}),
		prisma.uSER.groupBy({
			by: ["status"],
			where: { deletedAt: null },
			_count: { _all: true },
		}),
		prisma.organization.groupBy({
			by: ["status"],
			where: { deletedAt: null },
			_count: { _all: true },
		}),
		prisma.task.groupBy({
			by: ["status"],
			where: { deletedAt: null },
			_count: { _all: true },
		}),
		prisma.complaint.groupBy({
			by: ["status"],
			_count: { _all: true },
		}),
		prisma.payment.groupBy({
			by: ["status"],
			_count: { _all: true },
		}),
		prisma.organization.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: "desc" },
			take: 5,
			select: {
				id: true,
				name: true,
				email: true,
				plan: true,
				status: true,
				createdAt: true,
				owner: { select: { id: true, name: true, email: true } },
			},
		}),
		prisma.payment.findMany({
			orderBy: { createdAt: "desc" },
			take: 5,
			select: {
				id: true,
				organizationId: true,
				amount: true,
				currency: true,
				purchasedTeamCapacity: true,
				status: true,
				paidAt: true,
				createdAt: true,
				organization: { select: { id: true, name: true } },
			},
		}),
		prisma.complaint.findMany({
			orderBy: { createdAt: "desc" },
			take: 5,
			select: {
				id: true,
				organizationId: true,
				category: true,
				status: true,
				createdAt: true,
				organization: { select: { id: true, name: true } },
				complainant: { select: { id: true, name: true } },
				reportedUser: { select: { id: true, name: true } },
			},
		}),
	]);

	return {
		overview: {
			users: userCount,
			organizations: organizationCount,
			teams: teamCount,
			tasks: taskCount,
			subtasks: subtaskCount,
			complaints: complaintCount,
			payments: paymentCount,
			succeededRevenue: revenue._sum.amount ?? 0,
		},
		usersByStatus: countByEnum(
			Object.values(AccountStatus),
			usersByStatus,
			"status",
		),
		organizationsByStatus: countByEnum(
			Object.values(OrganizationStatus),
			organizationsByStatus,
			"status",
		),
		tasksByStatus: countByEnum(
			Object.values(TaskStatus),
			tasksByStatus,
			"status",
		),
		complaintsByStatus: countByEnum(
			Object.values(ComplaintStatus),
			complaintsByStatus,
			"status",
		),
		paymentsByStatus: countByEnum(
			Object.values(PaymentStatus),
			paymentsByStatus,
			"status",
		),
		recent: {
			organizations: recentOrganizations,
			payments: recentPayments,
			complaints: recentComplaints,
		},
	};
};

const listUsers = async (query: { search?: string; status?: AccountStatus }) =>
	prisma.uSER.findMany({
		where: {
			deletedAt: null,
			...(query.status ? { status: query.status } : {}),
			...(query.search
				? {
						OR: [
							{ name: { contains: query.search, mode: "insensitive" } },
							{ email: { contains: query.search, mode: "insensitive" } },
						],
					}
				: {}),
		},
		orderBy: { createdAt: "desc" },
		omit: { password: true },
	});

const getUser = async (userId: string) => {
	const user = await prisma.uSER.findFirst({
		where: { id: userId, deletedAt: null },
		omit: { password: true },
		include: {
			ownedOrganization: { select: { id: true, name: true, status: true } },
			memberships: {
				where: { deletedAt: null },
				select: {
					organizationId: true,
					role: true,
					status: true,
					organization: { select: { id: true, name: true, status: true } },
				},
			},
		},
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	return user;
};

const updateUserStatus = async (
	userId: string,
	adminId: string,
	payload: { status: AccountStatus; bannedReason?: string },
) => {
	if (userId === adminId) {
		throw new AppError(400, "You cannot change your own account status");
	}

	const user = await prisma.uSER.findFirst({
		where: { id: userId, deletedAt: null },
		select: { id: true, role: true },
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}
	if (user.role === Role.SUPER_ADMIN) {
		throw new AppError(403, "Super Admin accounts cannot be changed here");
	}
	if (
		payload.status === AccountStatus.BANNED &&
		!payload.bannedReason?.trim()
	) {
		throw new AppError(400, "A ban reason is required");
	}

	const updateData = {
		status: payload.status,
		bannedAt: payload.status === AccountStatus.BANNED ? new Date() : null,
		...(payload.status === AccountStatus.BANNED
			? { bannedReason: payload.bannedReason?.trim() ?? null }
			: { bannedReason: null }),
	};

	return prisma.uSER.update({
		where: { id: userId },
		data: updateData,
		omit: { password: true },
	});
};

const listOrganizations = async (query: {
	search?: string;
	status?: OrganizationStatus;
}) =>
	prisma.organization.findMany({
		where: {
			...(query.status ? { status: query.status } : {}),
			...(query.search
				? {
						OR: [
							{ name: { contains: query.search, mode: "insensitive" } },
							{ email: { contains: query.search, mode: "insensitive" } },
						],
					}
				: {}),
		},
		orderBy: { createdAt: "desc" },
		include: {
			owner: { select: { id: true, name: true, email: true, status: true } },
			_count: {
				select: { members: true, teams: true, tasks: true, complaints: true },
			},
		},
	});

const getOrganization = async (organizationId: string) => {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		include: {
			owner: { select: { id: true, name: true, email: true, status: true } },
			entitlement: true,
			_count: {
				select: {
					members: true,
					teams: true,
					tasks: true,
					complaints: true,
					payments: true,
				},
			},
		},
	});

	if (!organization) {
		throw new AppError(404, "Organization not found");
	}

	return organization;
};

const updateOrganizationStatus = async (
	organizationId: string,
	payload: { status: OrganizationStatus },
) => {
	const organization = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { id: true, status: true },
	});

	if (!organization) {
		throw new AppError(404, "Organization not found");
	}

	return prisma.organization.update({
		where: { id: organizationId },
		data: {
			status: payload.status,
			isSuspended: payload.status === OrganizationStatus.SUSPENDED,
			deletedAt:
				payload.status === OrganizationStatus.DEACTIVATED ? new Date() : null,
		},
	});
};

const listComplaints = async (organizationId?: string) => {
	const where = organizationId ? { organizationId } : {};
	return prisma.complaint.findMany({
		where,
		orderBy: { createdAt: "desc" },
		include: {
			organization: { select: { id: true, name: true } },
			complainant: { select: { id: true, name: true, email: true } },
			reportedUser: { select: { id: true, name: true, email: true } },
			reviewer: { select: { id: true, name: true, email: true } },
		},
	});
};

const getComplaint = async (complaintId: string) => {
	const complaint = await prisma.complaint.findUnique({
		where: { id: complaintId },
		include: {
			organization: { select: { id: true, name: true } },
			complainant: { select: { id: true, name: true, email: true } },
			reportedUser: { select: { id: true, name: true, email: true } },
			reviewer: { select: { id: true, name: true, email: true } },
		},
	});

	if (!complaint) {
		throw new AppError(404, "Complaint not found");
	}

	return complaint;
};

const listPayments = async (organizationId?: string) => {
	const where = organizationId ? { organizationId } : {};
	return prisma.payment.findMany({
		where,
		orderBy: { createdAt: "desc" },
		include: {
			organization: { select: { id: true, name: true, email: true } },
		},
	});
};

const getPayment = async (paymentId: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		include: {
			organization: { select: { id: true, name: true, email: true } },
		},
	});

	if (!payment) {
		throw new AppError(404, "Payment not found");
	}

	return payment;
};

export const superAdminService = {
	getDashboard,
	listUsers,
	getUser,
	updateUserStatus,
	listOrganizations,
	getOrganization,
	updateOrganizationStatus,
	listComplaints,
	getComplaint,
	listPayments,
	getPayment,
};
