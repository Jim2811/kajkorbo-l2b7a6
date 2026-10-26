import { randomUUID } from "node:crypto";
import { InvitationStatus, MemberStatus, PlanType, Role, } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
const createOrganization = async (userId, payload) => {
    return prisma.$transaction(async (transaction) => {
        const user = await transaction.uSER.findUnique({
            where: { id: userId },
            select: { role: true, status: true, deletedAt: true },
        });
        if (!user ||
            user.role !== Role.USER ||
            user.status !== "ACTIVE" ||
            user.deletedAt) {
            throw new AppError(403, "Only eligible users can create an organization");
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
            throw new AppError(409, "An organization with this email already exists");
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
    }, { isolationLevel: "Serializable" });
};
const listPublicOrganizations = async (search) => {
    const normalizedSearch = search?.trim();
    return prisma.organization.findMany({
        where: {
            status: "ACTIVE",
            isSuspended: false,
            deletedAt: null,
            ...(normalizedSearch
                ? {
                    OR: [
                        { name: { contains: normalizedSearch, mode: "insensitive" } },
                        {
                            description: {
                                contains: normalizedSearch,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            name: true,
            description: true,
            logo: true,
            slug: true,
            plan: true,
            createdAt: true,
        },
        orderBy: { name: "asc" },
    });
};
const hireOrganizationMember = async (organizationId, ownerId, payload) => {
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
            throw new AppError(403, "Only the active owner can manage this organization");
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
            throw new AppError(403, "Only the organization owner can hire organization members");
        }
        const user = await transaction.uSER.findFirst({
            where: { email: payload.email, deletedAt: null },
        });
        if (!user) {
            throw new AppError(404, "User not found");
        }
        if (user.id === ownerId || user.role === Role.ORG_OWNER) {
            throw new AppError(409, "An organization owner cannot be hired as an organization member");
        }
        const existingMembership = await transaction.organizationMember.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId: user.id,
                },
            },
        });
        if (existingMembership &&
            existingMembership.status === MemberStatus.ACTIVE &&
            existingMembership.deletedAt === null) {
            throw new AppError(409, "User is already a member of this organization");
        }
        const existingInvitation = await transaction.organizationInvitation.findFirst({
            where: {
                organizationId,
                invitedEmail: user.email,
                status: InvitationStatus.PENDING,
            },
        });
        if (existingInvitation) {
            throw new AppError(409, "A pending invitation already exists for this user");
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
const updateOrganization = async (organizationId, ownerId, payload) => {
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
const deactivateOrganization = async (organizationId, ownerId) => {
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
const createTeam = async (organizationId, ownerId, payload) => {
    return prisma.$transaction(async (transaction) => {
        const organization = await transaction.organization.findFirst({
            where: {
                id: organizationId,
                ownerId,
                status: "ACTIVE",
                deletedAt: null,
            },
            select: { id: true },
        });
        if (!organization) {
            throw new AppError(403, "Only the active owner can manage this organization");
        }
        const entitlement = await transaction.organizationEntitlement.findUnique({
            where: { organizationId },
        });
        if (!entitlement) {
            throw new AppError(409, "Organization team capacity is not configured");
        }
        const availableCapacity = entitlement.freeTeamCapacity +
            entitlement.purchasedTeamCapacity -
            entitlement.usedTeamCapacity;
        if (availableCapacity <= 0) {
            throw new AppError(409, "No team capacity is available. Purchase additional capacity first.");
        }
        const existingTeam = await transaction.team.findFirst({
            where: {
                organizationId,
                name: payload.name,
                deletedAt: null,
            },
            select: { id: true },
        });
        if (existingTeam) {
            throw new AppError(409, "A team with this name already exists");
        }
        const team = await transaction.team.create({
            data: { organizationId, ...payload },
        });
        await transaction.organizationEntitlement.update({
            where: { organizationId },
            data: { usedTeamCapacity: { increment: 1 } },
        });
        return team;
    }, { isolationLevel: "Serializable" });
};
const deleteTeam = async (teamId, ownerId) => {
    return prisma.$transaction(async (transaction) => {
        const team = await transaction.team.findFirst({
            where: {
                id: teamId,
                organization: { ownerId, status: "ACTIVE", deletedAt: null },
                status: { not: "DELETED" },
                deletedAt: null,
            },
            select: { id: true, organizationId: true },
        });
        if (!team) {
            throw new AppError(404, "Active team not found");
        }
        const deletedTeam = await transaction.team.update({
            where: { id: team.id },
            data: { status: "DELETED", deletedAt: new Date() },
        });
        await transaction.organizationEntitlement.updateMany({
            where: {
                organizationId: team.organizationId,
                usedTeamCapacity: { gt: 0 },
            },
            data: { usedTeamCapacity: { decrement: 1 } },
        });
        return deletedTeam;
    });
};
const addTeamMember = async (teamId, ownerId, payload) => {
    return prisma.$transaction(async (transaction) => {
        const team = await transaction.team.findFirst({
            where: {
                id: teamId,
                status: "ACTIVE",
                deletedAt: null,
                organization: { ownerId, status: "ACTIVE", deletedAt: null },
            },
            select: { id: true, organizationId: true },
        });
        if (!team) {
            throw new AppError(404, "Active team not found");
        }
        const member = await transaction.organizationMember.findFirst({
            where: {
                organizationId: team.organizationId,
                userId: payload.userId,
                status: "ACTIVE",
                deletedAt: null,
            },
            select: { userId: true },
        });
        if (!member) {
            throw new AppError(409, "User must be an active organization member");
        }
        const existingTeamMember = await transaction.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: payload.userId } },
        });
        if (existingTeamMember?.status === "ACTIVE" &&
            !existingTeamMember.deletedAt) {
            throw new AppError(409, "User is already a member of this team");
        }
        return existingTeamMember
            ? transaction.teamMember.update({
                where: { id: existingTeamMember.id },
                data: { status: "ACTIVE", role: "MEMBER", deletedAt: null },
            })
            : transaction.teamMember.create({
                data: { teamId, userId: payload.userId },
            });
    });
};
const removeTeamMember = async (teamId, userId, ownerId) => {
    return prisma.$transaction(async (transaction) => {
        const team = await transaction.team.findFirst({
            where: {
                id: teamId,
                status: "ACTIVE",
                deletedAt: null,
                organization: { ownerId, status: "ACTIVE", deletedAt: null },
            },
            select: { id: true },
        });
        if (!team) {
            throw new AppError(404, "Active team not found");
        }
        const teamMember = await transaction.teamMember.findFirst({
            where: { teamId, userId, status: "ACTIVE", deletedAt: null },
        });
        if (!teamMember) {
            throw new AppError(404, "Active team membership not found");
        }
        if (teamMember.role === "LEADER") {
            await transaction.team.update({
                where: { id: teamId },
                data: { leaderId: null },
            });
        }
        return transaction.teamMember.update({
            where: { id: teamMember.id },
            data: { status: "REMOVED", deletedAt: new Date(), role: "MEMBER" },
        });
    });
};
const assignTeamLeader = async (teamId, ownerId, payload) => {
    return prisma.$transaction(async (transaction) => {
        const team = await transaction.team.findFirst({
            where: {
                id: teamId,
                status: "ACTIVE",
                deletedAt: null,
                organization: { ownerId, status: "ACTIVE", deletedAt: null },
            },
            select: { id: true, organizationId: true },
        });
        if (!team) {
            throw new AppError(404, "Active team not found");
        }
        const teamMember = await transaction.teamMember.findFirst({
            where: {
                teamId,
                userId: payload.userId,
                status: "ACTIVE",
                deletedAt: null,
            },
        });
        const organizationMember = await transaction.organizationMember.findFirst({
            where: {
                organizationId: team.organizationId,
                userId: payload.userId,
                status: "ACTIVE",
                deletedAt: null,
            },
        });
        if (!teamMember || !organizationMember) {
            throw new AppError(409, "Team leader must be an active member of the organization and team");
        }
        await transaction.teamMember.updateMany({
            where: { teamId, status: "ACTIVE", deletedAt: null },
            data: { role: "MEMBER" },
        });
        await transaction.teamMember.update({
            where: { id: teamMember.id },
            data: { role: "LEADER" },
        });
        return transaction.team.update({
            where: { id: teamId },
            data: { leaderId: payload.userId },
        });
    });
};
export const organizationService = {
    createOrganization,
    listPublicOrganizations,
    hireOrganizationMember,
    updateOrganization,
    deactivateOrganization,
    createTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    assignTeamLeader,
};
//# sourceMappingURL=organization.service.js.map