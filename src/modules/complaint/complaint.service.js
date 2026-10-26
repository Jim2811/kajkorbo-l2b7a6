import { ComplaintStatus, MemberStatus, Role, TeamMemberRole, } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
const getActiveOrganizationMember = async (organizationId, userId) => prisma.organizationMember.findFirst({
    where: {
        organizationId,
        userId,
        status: MemberStatus.ACTIVE,
        deletedAt: null,
        organization: { status: "ACTIVE", deletedAt: null },
    },
    select: { role: true },
});
const getComplaintVisibilityFilter = (userId, organizationId, membershipRole) => ({
    organizationId,
    OR: [
        { complainantId: userId },
        { reportedUserId: userId },
        { reviewerId: userId },
        ...(membershipRole === Role.ORG_OWNER ? [{ organizationId }] : []),
    ],
});
const createComplaint = async (complainantId, payload) => {
    const complainant = await getActiveOrganizationMember(payload.organizationId, complainantId);
    if (!complainant) {
        throw new AppError(403, "Only active members of the organization can submit complaints");
    }
    if (payload.reportedUserId === complainantId) {
        throw new AppError(400, "You cannot submit a complaint against yourself");
    }
    const reportedUser = await getActiveOrganizationMember(payload.organizationId, payload.reportedUserId);
    if (!reportedUser) {
        throw new AppError(400, "The reported user must be an active member of the organization");
    }
    if (complainant.role === Role.ORG_OWNER &&
        reportedUser.role === Role.ORG_OWNER) {
        throw new AppError(400, "An organization owner cannot report another owner");
    }
    if (complainant.role === Role.TEAM_LEADER &&
        !["ORG_MEMBER", "TEAM_MEMBER"].includes(reportedUser.role)) {
        throw new AppError(403, "Team leaders can submit complaints only against team members");
    }
    if (complainant.role === Role.TEAM_MEMBER &&
        !["TEAM_LEADER", "ORG_MEMBER", "TEAM_MEMBER"].includes(reportedUser.role)) {
        throw new AppError(403, "Team members can submit complaints only against eligible organization members");
    }
    const relatedTeam = payload.teamId
        ? await prisma.team.findFirst({
            where: {
                id: payload.teamId,
                organizationId: payload.organizationId,
                status: "ACTIVE",
                deletedAt: null,
            },
            select: { id: true },
        })
        : null;
    if (payload.teamId && !relatedTeam) {
        throw new AppError(400, "Related team does not belong to this organization");
    }
    if (payload.teamId) {
        const teamMemberships = await prisma.teamMember.findMany({
            where: {
                teamId: payload.teamId,
                userId: { in: [complainantId, payload.reportedUserId] },
                status: MemberStatus.ACTIVE,
                deletedAt: null,
            },
            select: { userId: true, role: true },
        });
        const complainantTeamMembership = teamMemberships.find((member) => member.userId === complainantId);
        const reportedTeamMembership = teamMemberships.find((member) => member.userId === payload.reportedUserId);
        if (!complainantTeamMembership || !reportedTeamMembership) {
            throw new AppError(400, "Both users must be active members of the related team");
        }
        if (complainantTeamMembership.role === TeamMemberRole.LEADER &&
            reportedTeamMembership.role !== TeamMemberRole.MEMBER) {
            throw new AppError(403, "Team leaders can submit complaints only against team members");
        }
    }
    const relatedTask = payload.taskId
        ? await prisma.task.findFirst({
            where: {
                id: payload.taskId,
                organizationId: payload.organizationId,
                ...(payload.teamId ? { teamId: payload.teamId } : {}),
                deletedAt: null,
            },
            select: { id: true },
        })
        : null;
    if (payload.taskId && !relatedTask) {
        throw new AppError(400, "Related task does not belong to this organization or team");
    }
    if (payload.subtaskId) {
        const relatedSubtask = await prisma.subtask.findFirst({
            where: {
                id: payload.subtaskId,
                ...(payload.taskId ? { taskId: payload.taskId } : {}),
                task: {
                    organizationId: payload.organizationId,
                    ...(payload.teamId ? { teamId: payload.teamId } : {}),
                    deletedAt: null,
                },
                deletedAt: null,
            },
            select: { id: true },
        });
        if (!relatedSubtask) {
            throw new AppError(400, "Related subtask does not belong to this organization or task");
        }
    }
    return prisma.complaint.create({
        data: {
            organizationId: payload.organizationId,
            complainantId,
            reportedUserId: payload.reportedUserId,
            ...(payload.teamId ? { teamId: payload.teamId } : {}),
            ...(payload.taskId ? { taskId: payload.taskId } : {}),
            ...(payload.subtaskId ? { subtaskId: payload.subtaskId } : {}),
            category: payload.category,
            description: payload.description,
            ...(payload.evidenceUrl ? { evidenceUrl: payload.evidenceUrl } : {}),
        },
    });
};
const canViewComplaint = async (complaintId, userId) => {
    const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        select: {
            id: true,
            organizationId: true,
            complainantId: true,
            reportedUserId: true,
            reviewerId: true,
        },
    });
    if (!complaint) {
        throw new AppError(404, "Complaint not found");
    }
    const user = await prisma.uSER.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    const membership = await getActiveOrganizationMember(complaint.organizationId, userId);
    if (user?.role === Role.SUPER_ADMIN) {
        return complaint;
    }
    if (!membership) {
        const isParticipant = complaint.complainantId === userId ||
            complaint.reportedUserId === userId ||
            complaint.reviewerId === userId;
        if (!isParticipant) {
            throw new AppError(403, "You are not authorized to view this complaint");
        }
    }
    else if (membership.role !== Role.ORG_OWNER &&
        complaint.complainantId !== userId &&
        complaint.reportedUserId !== userId &&
        complaint.reviewerId !== userId) {
        throw new AppError(403, "You are not authorized to view this complaint");
    }
    return complaint;
};
const listComplaints = async (userId, organizationId) => {
    const user = await prisma.uSER.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    if (user?.role === Role.SUPER_ADMIN) {
        if (organizationId) {
            return prisma.complaint.findMany({
                where: { organizationId },
                orderBy: { createdAt: "desc" },
            });
        }
        return prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    if (!organizationId) {
        throw new AppError(400, "Organization ID is required");
    }
    const membership = await getActiveOrganizationMember(organizationId, userId);
    if (!membership) {
        throw new AppError(403, "You are not an active member of this organization");
    }
    return prisma.complaint.findMany({
        where: getComplaintVisibilityFilter(userId, organizationId, membership.role),
        orderBy: { createdAt: "desc" },
    });
};
const getComplaint = async (complaintId, userId) => {
    await canViewComplaint(complaintId, userId);
    return prisma.complaint.findUnique({
        where: { id: complaintId },
    });
};
const updateComplaintStatus = async (complaintId, userId, payload) => {
    const complaint = await canViewComplaint(complaintId, userId);
    const currentComplaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
        select: { status: true },
    });
    const user = await prisma.uSER.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    const membership = await getActiveOrganizationMember(complaint.organizationId, userId);
    if (user?.role !== Role.SUPER_ADMIN && membership?.role !== Role.ORG_OWNER) {
        throw new AppError(403, "Only the organization owner or Super Admin can update complaint status");
    }
    if (currentComplaint &&
        (currentComplaint.status === "RESOLVED" ||
            currentComplaint.status === "DISMISSED")) {
        throw new AppError(409, "A resolved complaint cannot change status");
    }
    if ((payload.status === "RESOLVED" || payload.status === "DISMISSED") &&
        !payload.resolutionNotes) {
        throw new AppError(400, "Resolution notes are required");
    }
    return prisma.complaint.update({
        where: { id: complaintId },
        data: {
            status: payload.status,
            reviewerId: userId,
            ...(payload.resolutionNotes
                ? { resolutionNotes: payload.resolutionNotes }
                : {}),
            ...(payload.status === ComplaintStatus.RESOLVED ||
                payload.status === ComplaintStatus.DISMISSED
                ? { resolvedAt: new Date() }
                : {}),
        },
    });
};
const resolveComplaint = async (complaintId, userId, payload) => updateComplaintStatus(complaintId, userId, payload.status === ComplaintStatus.RESOLVED
    ? {
        status: ComplaintStatus.RESOLVED,
        resolutionNotes: payload.resolutionNotes,
    }
    : {
        status: ComplaintStatus.DISMISSED,
        resolutionNotes: payload.resolutionNotes,
    });
export const complaintService = {
    createComplaint,
    listComplaints,
    getComplaint,
    updateComplaintStatus,
    resolveComplaint,
};
//# sourceMappingURL=complaint.service.js.map