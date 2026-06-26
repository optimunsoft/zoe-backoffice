export interface InternalCoreResponse<T> {
    status: boolean;
    message: string;
    response: T;
}
