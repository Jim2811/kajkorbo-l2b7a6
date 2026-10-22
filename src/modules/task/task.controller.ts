import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { taskService } from "./task.service.js";

const createTaskController = catchAsync(async (req: Request, res: Response) => {
	const task = await taskService.createTask(req.user?.id as string, req.body);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Task created successfully",
		data: { task },
	});
});

const acceptTaskController = catchAsync(async (req: Request, res: Response) => {
	const task = await taskService.acceptTask(
		req.params.taskId as string,
		req.user?.id as string,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Task accepted successfully",
		data: { task },
	});
});

const rejectTaskController = catchAsync(async (req: Request, res: Response) => {
	const task = await taskService.rejectTask(
		req.params.taskId as string,
		req.user?.id as string,
		req.body,
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Task rejected successfully",
		data: { task },
	});
});

export const taskController = {
	createTaskController,
	acceptTaskController,
	rejectTaskController,
};
