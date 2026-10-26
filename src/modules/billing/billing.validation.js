import { z } from "zod";
export const createCheckoutValidationSchema = z.object({
    additionalTeamCapacity: z
        .number()
        .int("Additional team capacity must be a whole number")
        .min(1, "At least one team capacity is required")
        .max(100, "Additional team capacity cannot exceed 100"),
});
//# sourceMappingURL=billing.validation.js.map