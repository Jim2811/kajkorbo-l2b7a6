import type { NextFunction, Request, Response } from "express";
import type { Role } from "./../../generated/prisma/enums";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: Role;
                avatar: string | null;
                provider: string;
                isVerified: boolean;
            };
        }
    }
}
export declare const auth: (...requiredRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map