type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
};

const createApiResponse = <T>(
    success: boolean,
    message: string,
    data?: T,
    error?: string
): ApiResponse<T> => {
    return {
        success,
        message,
        ...(data && { data }),    // include data only if provided
        ...(error && { error })   // include error only if provided
    };
};

