import { randomInt } from "node:crypto";

export const generateOtp = (): string =>
	randomInt(100_000, 1_000_000).toString();
