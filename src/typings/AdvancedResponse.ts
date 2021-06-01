import { SUCCESS, SUCCESS_CODE } from '@app/config';

export default class AdvancedResponse {
    public statusCode: number = SUCCESS_CODE;
    public message?: string;
    public status: string = SUCCESS;
    public data?: any[] | any;

    constructor({
        status,
        statusCode,
        message,
        data,
    }: {
        status?: string,
        statusCode?: number,
        message?: string,
        data?: any,
    } = {}) {
        this.status = status || this.status;
        this.statusCode = statusCode || this.statusCode;
        this.message = message;
        this.data = data;
    }
}