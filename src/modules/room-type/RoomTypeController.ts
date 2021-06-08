import { IRoomType, IRoute } from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import { forEach } from 'lodash';
import RoomType from './RoomType';

class RoomTypeController extends AbstractController {
    path = '/room-type';
    routes: IRoute[] = [
        {
            path: '/get',
            method: Methods.GET,
            middleware: [auth],
            handler: this.get,
        },
        {
            path: '/create',
            method: Methods.POST,
            validationSchema: {
                name: {
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
                base_price: {
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
        {
            path: '/update/:id',
            method: Methods.POST,
            validationSchema: {
                id: {
                    in: 'params',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
                name: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
                base_price: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.update,
        },
    ];

    protected async get(_req: Request, res: Response) {
        res.send(
            new AdvancedResponse({
                data: await RoomType.find().sort({ name: 1 }),
            }),
        );
    }

    protected async create({ body }: Request, res: Response) {
        const existed = (await RoomType.find()) as IRoomType[];
        forEach(existed, (r) => {
            if (r.name === body.name)
                throw new AdvancedError({
                    message: 'Duplicate room type name',
                    type: 'duplicate',
                });
        });
        body.name = body.name.toUpperCase();
        const roomType = await RoomType.create(body);
        res.send(
            new AdvancedResponse({
                data: roomType,
            }),
        );
    }

    protected async update({ body, params }: Request, res: Response) {
        const existed = (await RoomType.findById(params.id)) as IRoomType;
        if (!existed)
            throw new AdvancedError({
                message: 'Room type not found',
                type: 'not.found',
            });
        existed.set(body);
        await existed.save();
        res.send(
            new AdvancedResponse({
                data: existed,
            }),
        );
    }
}

export default RoomTypeController;
