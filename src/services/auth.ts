import { IMiddleware } from '@app/@types/global';
import AdvancedError from '@app/typings/AdvancedError';
import { validateToken } from '@app/utils';
import { Request, Response } from 'express';

const auth: IMiddleware = (req: Request, _res: Response, next) => {
    const authHeader = req.header('Authorization');
    try {
        if (!authHeader) {

            const err = new AdvancedError({
                message: 'Unauthorized, invalid token',
                type: 'auth.invalid',
            });
            err.setStatusCode(401);
            throw err;
        }
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            const err = new AdvancedError({
                message: 'Unauthorized, invalid token',
                type: 'auth.invalid',
            });
            err.setStatusCode(401);
            throw err;
        }
        const decoded: any = validateToken(accessToken);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

export default auth;