import type { Request, Response } from "express";
import httpStatus from "http-status";
import {
	AccountStatus,
	OrganizationStatus,
} from "../../../generated/prisma/enums.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { complaintService } from "../complaint/complaint.service.js";
import { superAdminService } from "./super-admin.service.js";

const getDashboardController = catchAsync(
	async (req: Request, res: Response) => {
		const dashboard = await superAdminService.getDashboard();

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Super Admin dashboard fetched successfully",
			data: { dashboard },
		});
	},
);

const getQueryString = (value: unknown) =>
	typeof value === "string" && value.trim() ? value.trim() : undefined;

const getEnumValue = <T extends string>(
	value: unknown,
	values: readonly T[],
	field: string,
) => {
	const stringValue = getQueryString(value);
	if (!stringValue) {
		return undefined;
	}
	if (!values.includes(stringValue as T)) {
		throw new AppError(400, `Invalid ${field}`);
	}
	return stringValue as T;
};

const listUsersController = catchAsync(async (req: Request, res: Response) => {
	const search = getQueryString(req.query.search);
	const status = getEnumValue(
		req.query.status,
		Object.values(AccountStatus),
		"user status",
	);
	const users = await superAdminService.listUsers({
		...(search ? { search } : {}),
		...(status ? { status } : {}),
	});
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Users fetched successfully",
		data: { users },
	});
});

const getUserController = catchAsync(async (req: Request, res: Response) => {
	const user = await superAdminService.getUser(req.params.userId as string);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User fetched successfully",
		data: { user },
	});
});

const updateUserStatusController = catchAsync(
	async (req: Request, res: Response) => {
		const user = await superAdminService.updateUserStatus(
			req.params.userId as string,
			req.user?.id as string,
			req.body,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "User status updated successfully",
			data: { user },
		});
	},
);

const listOrganizationsController = catchAsync(
	async (req: Request, res: Response) => {
		const search = getQueryString(req.query.search);
		const status = getEnumValue(
			req.query.status,
			Object.values(OrganizationStatus),
			"organization status",
		);
		const organizations = await superAdminService.listOrganizations({
			...(search ? { search } : {}),
			...(status ? { status } : {}),
		});
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organizations fetched successfully",
			data: { organizations },
		});
	},
);

const getOrganizationController = catchAsync(
	async (req: Request, res: Response) => {
		const organization = await superAdminService.getOrganization(
			req.params.organizationId as string,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization fetched successfully",
			data: { organization },
		});
	},
);

const updateOrganizationStatusController = catchAsync(
	async (req: Request, res: Response) => {
		const organization = await superAdminService.updateOrganizationStatus(
			req.params.organizationId as string,
			req.body,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Organization status updated successfully",
			data: { organization },
		});
	},
);

const listComplaintsController = catchAsync(
	async (req: Request, res: Response) => {
		const complaints = await superAdminService.listComplaints(
			getQueryString(req.query.organizationId),
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Complaints fetched successfully",
			data: { complaints },
		});
	},
);

const getComplaintController = catchAsync(
	async (req: Request, res: Response) => {
		const complaint = await superAdminService.getComplaint(
			req.params.complaintId as string,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Complaint fetched successfully",
			data: { complaint },
		});
	},
);

const updateComplaintStatusController = catchAsync(
	async (req: Request, res: Response) => {
		const complaint = await complaintService.updateComplaintStatus(
			req.params.complaintId as string,
			req.user?.id as string,
			req.body,
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Complaint status updated successfully",
			data: { complaint },
		});
	},
);

const listPaymentsController = catchAsync(
	async (req: Request, res: Response) => {
		const payments = await superAdminService.listPayments(
			getQueryString(req.query.organizationId),
		);
		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Payments fetched successfully",
			data: { payments },
		});
	},
);

const getPaymentController = catchAsync(async (req: Request, res: Response) => {
	const payment = await superAdminService.getPayment(
		req.params.paymentId as string,
	);
	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Payment fetched successfully",
		data: { payment },
	});
});

export const superAdminController = {
	getDashboardController,
	listUsersController,
	getUserController,
	updateUserStatusController,
	listOrganizationsController,
	getOrganizationController,
	updateOrganizationStatusController,
	listComplaintsController,
	getComplaintController,
	updateComplaintStatusController,
	listPaymentsController,
	getPaymentController,
};
