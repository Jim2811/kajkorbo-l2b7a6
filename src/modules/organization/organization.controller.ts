import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { organizationService } from "./organization.service.js";

const listPublicOrganizationsController = catchAsync(
	async (req: Request, res: Response) => {
		const organizations = await organizationService.listPublicOrganizations(
			typeof req.query.search === "string" ? req.query.search : undefined,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Public organizations fetched successfully",
			data: { organizations },
		});
	},
);

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

const createTeamController = catchAsync(async (req: Request, res: Response) => {
	const team = await organizationService.createTeam(
		req.params.organizationId as string,
		req.user?.id as string,
		req.body,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Team created successfully",
		data: { team },
	});
});

const deleteTeamController = catchAsync(async (req: Request, res: Response) => {
	const team = await organizationService.deleteTeam(
		req.params.teamId as string,
		req.user?.id as string,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Team deleted successfully",
		data: { team },
	});
});

const addTeamMemberController = catchAsync(
	async (req: Request, res: Response) => {
		const membership = await organizationService.addTeamMember(
			req.params.teamId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Team member added successfully",
			data: { membership },
		});
	},
);

const removeTeamMemberController = catchAsync(
	async (req: Request, res: Response) => {
		const membership = await organizationService.removeTeamMember(
			req.params.teamId as string,
			req.params.userId as string,
			req.user?.id as string,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Team member removed successfully",
			data: { membership },
		});
	},
);

const assignTeamLeaderController = catchAsync(
	async (req: Request, res: Response) => {
		const team = await organizationService.assignTeamLeader(
			req.params.teamId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Team leader assigned successfully",
			data: { team },
		});
	},
);

export const organizationController = {
	listPublicOrganizationsController,
	createOrganizationController,
	hireOrganizationMemberController,
	updateOrganizationController,
	deactivateOrganizationController,
	createTeamController,
	deleteTeamController,
	addTeamMemberController,
	removeTeamMemberController,
	assignTeamLeaderController,
};
