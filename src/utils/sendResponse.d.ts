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
export declare const sendResponse: <T>(res: Response, responseData: TResponseData<T>) => Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=sendResponse.d.ts.map