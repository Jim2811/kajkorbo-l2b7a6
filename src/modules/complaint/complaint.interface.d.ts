import type { ComplaintStatus } from "../../../generated/prisma/enums.js";
export interface ICreateComplaintPayload {
    organizationId: string;
    reportedUserId: string;
    teamId?: string;
    taskId?: string;
    subtaskId?: string;
    category: string;
    description: string;
    evidenceUrl?: string;
}
export interface IUpdateComplaintStatusPayload {
    status: ComplaintStatus;
    resolutionNotes?: string;
}
export interface IResolveComplaintPayload {
    status: "RESOLVED" | "DISMISSED";
    resolutionNotes: string;
}
//# sourceMappingURL=complaint.interface.d.ts.map