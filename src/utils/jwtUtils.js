import jwt, {} from "jsonwebtoken";
const createToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, {
    expiresIn: expiresIn,
});
const verifyToken = (token, secret) => {
    try {
        return {
            success: true,
            data: jwt.verify(token, secret),
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Invalid token",
        };
    }
};
export const jwtUtils = {
    createToken,
    verifyToken,
};
//# sourceMappingURL=jwtUtils.js.map