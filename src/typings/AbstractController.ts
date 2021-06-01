import { ExpressValidatorError, IHandler, IRoute } from '@app/@types/global';
import { catchAsync } from '@app/utils';
import express, { Request, Response, Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { forEach } from 'lodash';
import AdvancedError from './AdvancedError';

export default abstract class AbstractController {
    public router: Router = express.Router();
    public abstract path: string;
    protected abstract readonly routes: IRoute[] = [];
    public returnRoutes = (): Router => {
        forEach(this.routes, (r: IRoute) => {
            forEach(r.middleware, mw => {
                this.router.use(r.path, mw);
            });
            const args: Array<IHandler | any> = [];
            if (r.validationSchema) args.push(...checkSchema(r.validationSchema), this.validateArg);
            args.push(catchAsync(r.handler));
            switch (r.method) {
                case 'GET':
                    this.router.get(r.path, ...args);
                    break;
                case 'POST':
                    this.router.post(r.path, ...args);
                case 'PUT':
                    this.router.put(r.path, ...args);
                    break;
                case 'PATCH':
                    this.router.patch(r.path, ...args);
                    break;
                case 'DELETE':
                    this.router.delete(r.path, ...args);
                    break;
                default:
                    throw new AdvancedError({
                        message: 'Invalid method',
                        type: 'method.error',
                    });
            }
        });
        return this.router;
    }

    private validateArg(req: Request, _res: Response, next): void {
        const { errors }: any = validationResult(req);
        if (errors.length) {
            const { location, param, msg, value: _value }: ExpressValidatorError = errors[0];
            throw new AdvancedError({
                message: `${location}['${param}'] ${msg}`,
                type: 'validation.error',
            });
        } else next();
    }

}

