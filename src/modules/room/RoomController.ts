import { IRoom, IRoute } from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import Room from './Room';

class RoomController extends AbstractController {
    path = '/room';
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
                floor: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
                number: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
                room_type: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
        {
            path: '/get-by-id/:id',
            method: Methods.GET,
            validationSchema: {
                id: {
                    in: 'params',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.getById,
        },
    ];
    protected async get(_req: Request, res: Response) {
        res.send(new AdvancedResponse({
            data: await Room.find() as IRoom[],
        }));
    }

    protected async create({ body }: Request, res: Response) {
        const room = await Room.create(body) as IRoom;
        res.send(new AdvancedResponse({
            data: room,
        }));
    }

    protected async getById({ params }: Request, res: Response) {
        const room = await Room.findById(params.id) as IRoom;
        if (!room) throw new AdvancedError({
            message: 'Room not found',
            type: 'not.found',
        });
        res.send(new AdvancedResponse({
            data: room,
        }));
    }
}

export default RoomController;