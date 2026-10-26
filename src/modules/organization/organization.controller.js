import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { organizationService } from "./organization.service.js";
const listPublicOrganizationsController = catchAsync(async (req, res) => {
    const organizations = await organizationService.listPublicOrganizations(typeof req.query.search === "string" ? req.query.search : undefined);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Public organizations fetched successfully",
        data: { organizations },
    });
});
const createOrganizationController = catchAsync(async (req, res) => {
    const organization = await organizationService.createOrganization(req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Organization created successfully",
        data: { organization },
    });
});
const hireOrganizationMemberController = catchAsync(async (req, res) => {
    const invitation = await organizationService.hireOrganizationMember(req.params.organizationId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Organization invitation created successfully",
        data: { invitation },
    });
});
const updateOrganizationController = catchAsync(async (req, res) => {
    const organization = await organizationService.updateOrganization(req.params.organizationId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Organization updated successfully",
        data: { organization },
    });
});
const deactivateOrganizationController = catchAsync(async (req, res) => {
    const organization = await organizationService.deactivateOrganization(req.params.organizationId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Organization deactivated successfully",
        data: { organization },
    });
});
const createTeamController = catchAsync(async (req, res) => {
    const team = await organizationService.createTeam(req.params.organizationId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Team created successfully",
        data: { team },
    });
});
const deleteTeamController = catchAsync(async (req, res) => {
    const team = await organizationService.deleteTeam(req.params.teamId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team deleted successfully",
        data: { team },
    });
});
const addTeamMemberController = catchAsync(async (req, res) => {
    const membership = await organizationService.addTeamMember(req.params.teamId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Team member added successfully",
        data: { membership },
    });
});
const removeTeamMemberController = catchAsync(async (req, res) => {
    const membership = await organizationService.removeTeamMember(req.params.teamId, req.params.userId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team member removed successfully",
        data: { membership },
    });
});
const assignTeamLeaderController = catchAsync(async (req, res) => {
    const team = await organizationService.assignTeamLeader(req.params.teamId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Team leader assigned successfully",
        data: { team },
    });
});
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
//# sourceMappingURL=organization.controller.js.map