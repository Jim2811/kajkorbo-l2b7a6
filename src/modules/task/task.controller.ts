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

const createSubtaskController = catchAsync(
	async (req: Request, res: Response) => {
		const subtask = await taskService.createSubtask(
			req.params.taskId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Subtask assigned successfully",
			data: { subtask },
		});
	},
);

const submitSubtaskController = catchAsync(
	async (req: Request, res: Response) => {
		const submission = await taskService.submitSubtask(
			req.params.subtaskId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Subtask submitted successfully",
			data: { submission },
		});
	},
);

const approveSubtaskController = catchAsync(
	async (req: Request, res: Response) => {
		const subtask = await taskService.reviewSubtask(
			req.params.subtaskId as string,
			req.user?.id as string,
			true,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Subtask approved successfully",
			data: { subtask },
		});
	},
);

const requestSubtaskRevisionController = catchAsync(
	async (req: Request, res: Response) => {
		const subtask = await taskService.reviewSubtask(
			req.params.subtaskId as string,
			req.user?.id as string,
			false,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Subtask revision requested successfully",
			data: { subtask },
		});
	},
);

const reassignSubtaskController = catchAsync(
	async (req: Request, res: Response) => {
		const subtask = await taskService.reassignSubtask(
			req.params.subtaskId as string,
			req.user?.id as string,
			req.body,
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.OK,
			message: "Subtask reassigned successfully",
			data: { subtask },
		});
	},
);

export const taskController = {
	createTaskController,
	acceptTaskController,
	rejectTaskController,
	createSubtaskController,
	submitSubtaskController,
	approveSubtaskController,
	requestSubtaskRevisionController,
	reassignSubtaskController,
};
