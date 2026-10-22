import { randomUUID } from "node:crypto";
import {
	InvitationStatus,
	MemberStatus,
	PlanType,
	Role,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
	ICreateOrganizationPayload,
	IHireOrganizationMemberPayload,
	IUpdateOrganizationPayload,
} from "./organization.interface.js";

const createOrganization = async (
	userId: string,
	payload: ICreateOrganizationPayload,
) => {
	return prisma.$transaction(
		async (transaction) => {
			const user = await transaction.uSER.findUnique({
				where: { id: userId },
				select: { role: true, status: true, deletedAt: true },
			});

			if (
				!user ||
				user.role !== Role.USER ||
				user.status !== "ACTIVE" ||
				user.deletedAt
			) {
				throw new AppError(
					403,
					"Only eligible users can create an organization",
				);
			}

			const ownedOrganizationCount = await transaction.organization.count({
				where: {
					ownerId: userId,
					deletedAt: null,
				},
			});

			if (ownedOrganizationCount >= 1) {
				throw new AppError(409, "Each user can own only one organization");
			}

			const existingOrganization = await transaction.organization.findUnique({
				where: { email: payload.email },
			});

			if (existingOrganization) {
				throw new AppError(
					409,
					"An organization with this email already exists",
				);
			}

			const organization = await transaction.organization.create({
				data: {
					...payload,
					ownerId: userId,
					plan: PlanType.FREE,
				},
			});

			await transaction.organizationMember.create({
				data: {
					organizationId: organization.id,
					userId,
					role: Role.ORG_OWNER,
					status: MemberStatus.ACTIVE,
				},
			});

			await transaction.organizationEntitlement.create({
				data: { organizationId: organization.id },
			});

			await transaction.uSER.update({
				where: { id: userId },
				data: { role: Role.ORG_OWNER },
			});

			return organization;
		},
		{ isolationLevel: "Serializable" },
	);
};

const hireOrganizationMember = async (
	organizationId: string,
	ownerId: string,
	payload: IHireOrganizationMemberPayload,
) => {
	return prisma.$transaction(async (transaction) => {
		const organization = await transaction.organization.findFirst({
			where: {
				id: organizationId,
				ownerId,
				status: "ACTIVE",
				deletedAt: null,
			},
		});

		if (!organization) {
			throw new AppError(
				403,
				"Only the active owner can manage this organization",
			);
		}

		const ownerMembership = await transaction.organizationMember.findFirst({
			where: {
				organizationId,
				userId: ownerId,
				role: Role.ORG_OWNER,
				status: MemberStatus.ACTIVE,
				deletedAt: null,
			},
		});

		if (!ownerMembership) {
			throw new AppError(
				403,
				"Only the organization owner can hire organization members",
			);
		}

		const user = await transaction.uSER.findFirst({
			where: { email: payload.email, deletedAt: null },
		});

		if (!user) {
			throw new AppError(404, "User not found");
		}

		if (user.id === ownerId || user.role === Role.ORG_OWNER) {
			throw new AppError(
				409,
				"An organization owner cannot be hired as an organization member",
			);
		}

		const existingMembership = await transaction.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId,
					userId: user.id,
				},
			},
		});

		if (
			existingMembership &&
			existingMembership.status === MemberStatus.ACTIVE &&
			existingMembership.deletedAt === null
		) {
			throw new AppError(409, "User is already a member of this organization");
		}

		const existingInvitation =
			await transaction.organizationInvitation.findFirst({
				where: {
					organizationId,
					invitedEmail: user.email,
					status: InvitationStatus.PENDING,
				},
			});

		if (existingInvitation) {
			throw new AppError(
				409,
				"A pending invitation already exists for this user",
			);
		}

		const invitation = await transaction.organizationInvitation.create({
			data: {
				organizationId,
				invitedUserId: user.id,
				invitedEmail: user.email,
				invitedById: ownerId,
				token: randomUUID(),
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			},
		});

		return invitation;
	});
};

const updateOrganization = async (
	organizationId: string,
	ownerId: string,
	payload: IUpdateOrganizationPayload,
) => {
	const organization = await prisma.organization.findFirst({
		where: {
			id: organizationId,
			ownerId,
			status: "ACTIVE",
			deletedAt: null,
		},
	});

	if (!organization) {
		throw new AppError(404, "Active organization not found");
	}

	if (payload.email && payload.email !== organization.email) {
		const organizationWithEmail = await prisma.organization.findUnique({
			where: { email: payload.email },
			select: { id: true },
		});

		if (organizationWithEmail && organizationWithEmail.id !== organizationId) {
			throw new AppError(409, "An organization with this email already exists");
		}
	}

	return prisma.organization.update({
		where: { id: organizationId },
		data: payload,
	});
};

const deactivateOrganization = async (
	organizationId: string,
	ownerId: string,
) => {
	const organization = await prisma.organization.findFirst({
		where: {
			id: organizationId,
			ownerId,
			status: "ACTIVE",
			deletedAt: null,
		},
		select: { id: true },
	});

	if (!organization) {
		throw new AppError(404, "Active organization not found");
	}

	return prisma.organization.update({
		where: { id: organization.id },
		data: {
			status: "DEACTIVATED",
			isSuspended: false,
			deletedAt: new Date(),
		},
	});
};

export const organizationService = {
	createOrganization,
	hireOrganizationMember,
	updateOrganization,
	deactivateOrganization,
};
