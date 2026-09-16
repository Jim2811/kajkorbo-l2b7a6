import type { Response } from "express";

type TMeta = {
	page: number;
	limit: number;
	total: number;
};

type TResponseData<T> = {
	success: boolean;
	statusCode: number;
	message: string;
	data: T;
	meta?: TMeta;
};

export const sendResponse = <T>(
	res: Response,
	responseData: TResponseData<T>,
) => {
	const response = {
		success: responseData.success,
		statusCode: responseData.statusCode,
		message: responseData.message,
		data: responseData.data,
		...(responseData.meta ? { meta: responseData.meta } : {}),
	};

	return res.status(responseData.statusCode).json(response);
};
