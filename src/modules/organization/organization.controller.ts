import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { organizationService } from "./organization.service.js";

const createOrganizationController = catchAsync(
	async (req: Request, res: Response) => {
		const organization = await organizationService.createOrganization(
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Organization created successfully",
			data: { organization },
		});
	},
);

export const organizationController = {
	createOrganizationController,
};
