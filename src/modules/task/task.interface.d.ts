import type { TaskPriority } from "../../../generated/prisma/enums.js";
export interface ICreateTaskPayload {
    teamId: string;
    title: string;
    description: string;
    priority?: TaskPriority;
    startAt?: string;
    dueAt: string;
}
export interface IRejectTaskPayload {
    reason: string;
}
export interface ICreateSubtaskPayload {
    assignedUserId: string;
    title: string;
    description: string;
    dueAt: string;
}
export interface ISubmitSubtaskPayload {
    description: string;
}
export interface IReviewSubtaskPayload {
    feedback?: string;
}
export interface IRequestSubtaskRevisionPayload {
    feedback: string;
}
export interface IReassignSubtaskPayload {
    assignedUserId: string;
}
//# sourceMappingURL=task.interface.d.ts.map