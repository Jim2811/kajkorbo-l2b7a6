import type { Request, Response } from "express";
export declare const organizationController: {
    listPublicOrganizationsController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    createOrganizationController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    hireOrganizationMemberController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateOrganizationController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deactivateOrganizationController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    createTeamController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteTeamController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    addTeamMemberController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    removeTeamMemberController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    assignTeamLeaderController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=organization.controller.d.ts.map