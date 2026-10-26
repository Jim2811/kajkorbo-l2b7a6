export const sendResponse = (res, responseData) => {
    const response = {
        success: responseData.success,
        statusCode: responseData.statusCode,
        message: responseData.message,
        data: responseData.data,
        ...(responseData.meta ? { meta: responseData.meta } : {}),
    };
    return res.status(responseData.statusCode).json(response);
};
//# sourceMappingURL=sendResponse.js.map