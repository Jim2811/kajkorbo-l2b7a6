import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { complaintService } from "./complaint.service.js";
const createComplaintController = catchAsync(async (req, res) => {
    const complaint = await complaintService.createComplaint(req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Complaint submitted successfully",
        data: { complaint },
    });
});
const listComplaintsController = catchAsync(async (req, res) => {
    const complaints = await complaintService.listComplaints(req.user?.id, typeof req.query.organizationId === "string"
        ? req.query.organizationId
        : undefined);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Complaints fetched successfully",
        data: { complaints },
    });
});
const getComplaintController = catchAsync(async (req, res) => {
    const complaint = await complaintService.getComplaint(req.params.complaintId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Complaint fetched successfully",
        data: { complaint },
    });
});
const updateComplaintStatusController = catchAsync(async (req, res) => {
    const complaint = await complaintService.updateComplaintStatus(req.params.complaintId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Complaint status updated successfully",
        data: { complaint },
    });
});
const resolveComplaintController = catchAsync(async (req, res) => {
    const complaint = await complaintService.resolveComplaint(req.params.complaintId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Complaint resolved successfully",
        data: { complaint },
    });
});
export const complaintController = {
    createComplaintController,
    listComplaintsController,
    getComplaintController,
    updateComplaintStatusController,
    resolveComplaintController,
};
//# sourceMappingURL=complaint.controller.js.map