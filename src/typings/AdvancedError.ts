interface IAdvancedError {
    message: string;
    type: string;
}

export default class AdvancedError extends Error {
    public statusCode: number;
    public errors: IAdvancedError;
    constructor(errors: IAdvancedError) {
        super();
        this.statusCode = 400;
        this.errors = errors;
    }

    public setStatusCode(code: number) {
        this.statusCode = code;
    }
}