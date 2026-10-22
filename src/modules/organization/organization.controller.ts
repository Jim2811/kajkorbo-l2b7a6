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

const hireOrganizationMemberController = catchAsync(
	async (req: Request, res: Response) => {
		const invitation = await organizationService.hireOrganizationMember(
			req.params.organizationId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Organization invitation created successfully",
			data: { invitation },
		});
	},
);

const updateOrganizationController = catchAsync(
	async (req: Request, res: Response) => {
		const organization = await organizationService.updateOrganization(
			req.params.organizationId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization updated successfully",
			data: { organization },
		});
	},
);

const deactivateOrganizationController = catchAsync(
	async (req: Request, res: Response) => {
		const organization = await organizationService.deactivateOrganization(
			req.params.organizationId as string,
			req.user?.id as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization deactivated successfully",
			data: { organization },
		});
	},
);

export const organizationController = {
	createOrganizationController,
	hireOrganizationMemberController,
	updateOrganizationController,
	deactivateOrganizationController,
};
