import { randomInt } from "node:crypto";
export const generateOtp = () => randomInt(100_000, 1_000_000).toString();
//# sourceMappingURL=otp.js.map