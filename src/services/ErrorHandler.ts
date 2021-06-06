import AdvancedError from '@app/typings/AdvancedError';
import chalk from 'chalk';
import { NextFunction, Request, Response } from 'express';

export const notFound = (
    req: Request,
    _res: Response,
    next: NextFunction,
): any => {
    const error = new AdvancedError({
        message: `Not found - ${req.protocol}://${req.hostname}${req.originalUrl}`,
        type: 'not.found',
    });
    error.setStatusCode(404);
    next(error);
};

export const errHandler = (
    err: AdvancedError,
    _req: Request,
    res: Response,
    _next: any,
): any => {
    console.log(
        chalk.bgRed.white('Error======================================'),
    );
    console.log(err);
    const _err = new AdvancedError(
        err.errors
            ? err.errors
            : {
                  message: err.message,
                  type: 'server.error',
              },
    );
    // tslint:disable-next-line: no-unused-expression
    _err.setStatusCode(err.statusCode || 500);
    res.status(_err.statusCode).send(_err.errors);
};
