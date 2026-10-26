import { type JwtPayload } from "jsonwebtoken";
declare const createToken: (payload: JwtPayload, secret: string, expiresIn: string) => string;
declare const verifyToken: (token: string, secret: string) => {
    success: true;
    data: string | JwtPayload;
    error?: never;
} | {
    data?: never;
    success: false;
    error: string;
};
export declare const jwtUtils: {
    createToken: typeof createToken;
    verifyToken: typeof verifyToken;
};
export {};
//# sourceMappingURL=jwtUtils.d.ts.map