import type { Request, Response } from "express";
export declare const authController: {
    registerController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    verifyEmailController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    loginController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    meController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateProfileController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    uploadAvatarController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    googleLoginController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    forgotPassController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    resetPassController: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
//# sourceMappingURL=auth.controller.d.ts.map