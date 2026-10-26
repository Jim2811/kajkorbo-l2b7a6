import type { Request, Response } from "express";
export declare const taskController: {
    createTaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    acceptTaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    rejectTaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    completeTaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    createSubtaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    submitSubtaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    approveSubtaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    requestSubtaskRevisionController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    reassignSubtaskController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=task.controller.d.ts.map