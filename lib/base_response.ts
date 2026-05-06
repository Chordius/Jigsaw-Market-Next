export interface BaseResponse<T = null> {
    success: boolean;
    message: string;
    payload: T;
}

export const baseResponse = <T = null>(
    success: boolean,
    message: string,
    payload: T = null as T
): BaseResponse<T> => ({ success, message, payload });