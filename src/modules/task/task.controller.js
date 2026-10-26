import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { taskService } from "./task.service.js";
const createTaskController = catchAsync(async (req, res) => {
    const task = await taskService.createTask(req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Task created successfully",
        data: { task },
    });
});
const acceptTaskController = catchAsync(async (req, res) => {
    const task = await taskService.acceptTask(req.params.taskId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Task accepted successfully",
        data: { task },
    });
});
const rejectTaskController = catchAsync(async (req, res) => {
    const task = await taskService.rejectTask(req.params.taskId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Task rejected successfully",
        data: { task },
    });
});
const completeTaskController = catchAsync(async (req, res) => {
    const task = await taskService.completeTask(req.params.taskId, req.user?.id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Task completed successfully",
        data: { task },
    });
});
const createSubtaskController = catchAsync(async (req, res) => {
    const subtask = await taskService.createSubtask(req.params.taskId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Subtask assigned successfully",
        data: { subtask },
    });
});
const submitSubtaskController = catchAsync(async (req, res) => {
    const submission = await taskService.submitSubtask(req.params.subtaskId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Subtask submitted successfully",
        data: { submission },
    });
});
const approveSubtaskController = catchAsync(async (req, res) => {
    const subtask = await taskService.reviewSubtask(req.params.subtaskId, req.user?.id, true, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Subtask approved successfully",
        data: { subtask },
    });
});
const requestSubtaskRevisionController = catchAsync(async (req, res) => {
    const subtask = await taskService.reviewSubtask(req.params.subtaskId, req.user?.id, false, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Subtask revision requested successfully",
        data: { subtask },
    });
});
const reassignSubtaskController = catchAsync(async (req, res) => {
    const subtask = await taskService.reassignSubtask(req.params.subtaskId, req.user?.id, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Subtask reassigned successfully",
        data: { subtask },
    });
});
export const taskController = {
    createTaskController,
    acceptTaskController,
    rejectTaskController,
    completeTaskController,
    createSubtaskController,
    submitSubtaskController,
    approveSubtaskController,
    requestSubtaskRevisionController,
    reassignSubtaskController,
};
//# sourceMappingURL=task.controller.js.map