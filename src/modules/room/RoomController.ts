import { IRoom, IRoute } from '@app/@types/global';
import { ROOM } from '@app/config';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { hasRole } from '@app/utils';
import { Request, Response } from 'express';
import { some } from 'lodash';
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
            path: '/update-by-id/:id',
            method: Methods.PUT,
            validationSchema: {
                id: {
                    in: 'params',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.update,
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
        {
            path: '/delete-by-id/:id',
            method: Methods.DELETE,
            validationSchema: {
                id: {
                    in: 'params',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.deleteById,
        },
    ];
    protected async get({ query }: Request, res: Response) {
        const { room_type, status } = query;
        let aggregates = [];
        const matches = {
            $match: {},
        };
        const lookups = [
            {
                $lookup: {
                    from: 'roomtypes',
                    localField: 'room_type',
                    foreignField: '_id',
                    as: 'room_type',
                },
            },
            {
                $unwind: {
                    path: '$room_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];
        if (room_type) matches.$match['room_type.name'] = room_type;
        if (status) {
            matches.$match['status'] = status;
        }

        const project = [
            {
                $project: {
                    _id: 1,
                    floor: 1,
                    number: 1,
                    room_type: 1,
                    status: 1,
                    room_name: 1,
                },
            },
        ];
        aggregates = [...aggregates, ...lookups, matches, ...project];
        const rooms = (await Room.aggregate(aggregates)) as IRoom[];
        res.send(
            new AdvancedResponse({
                data: rooms,
            }),
        );
    }

    protected async create({ user, body }: Request, res: Response) {
        hasRole(user, ['manager']);
        let { number: roomNumber, floor } = body;
        roomNumber = parseInt(roomNumber, 10);
        floor = parseInt(floor, 10);

        if (roomNumber > ROOM.MAX_ROOM) {
            throw new AdvancedError({
                message: 'Room number cannot exceed ' + ROOM.MAX_ROOM,
                type: 'invalid',
            });
        }

        if (floor > ROOM.MAX_FLOOR) {
            throw new AdvancedError({
                message: 'Floor cannot exceed ' + ROOM.MAX_FLOOR,
                type: 'invalid',
            });
        }
        const existedRooms = (await Room.find()) as IRoom[];
        if (
            some(existedRooms, {
                number: roomNumber,
                floor,
            })
        ) {
            throw new AdvancedError({
                message: 'Room already exists',
                type: 'invalid',
            });
        }
        const room = (await Room.create(body)) as IRoom;
        res.send(
            new AdvancedResponse({
                data: room,
            }),
        );
    }

    protected async update({ user, body, params }: Request, res: Response) {
        hasRole(user, ['manager']);
        let { number: roomNumber, floor } = body;
        roomNumber = parseInt(roomNumber, 10);
        floor = parseInt(floor, 10);

        if (roomNumber > ROOM.MAX_ROOM) {
            throw new AdvancedError({
                message: 'Room number cannot exceed ' + ROOM.MAX_ROOM,
                type: 'invalid',
            });
        }

        if (floor > ROOM.MAX_FLOOR) {
            throw new AdvancedError({
                message: 'Floor cannot exceed ' + ROOM.MAX_FLOOR,
                type: 'invalid',
            });
        }

        const existedRooms = (await Room.find()) as IRoom[];
        if (
            some(existedRooms, {
                number: roomNumber,
                floor,
            })
        ) {
            throw new AdvancedError({
                message: 'Room already exists',
                type: 'invalid',
            });
        }
        const room = (await Room.findById(params.id)) as IRoom;
        if (!room) {
            throw new AdvancedError({
                message: 'Room not found',
                type: 'not.found',
            });
        }
        room.set(body);
        await room.save();
        res.send(
            new AdvancedResponse({
                message: 'Update success',
                data: {},
            }),
        );
    }

    protected async getById({ params, user }: Request, res: Response) {
        hasRole(user, ['manager']);

        const room = (await Room.findById(params.id)) as IRoom;
        if (!room)
            throw new AdvancedError({
                message: 'Room not found',
                type: 'not.found',
            });
        res.send(
            new AdvancedResponse({
                data: room,
            }),
        );
    }

    protected async deleteById({ params, user }: Request, res: Response) {
        hasRole(user, ['manager']);
        const room = (await Room.findOne({
            _id: params.id,
            status: 'V',
        })) as IRoom;

        if (!room) {
            throw new AdvancedError({
                message: 'Room is currently in use',
                type: 'invalid',
            });
        }
        await Room.deleteOne({ _id: room._id });
        res.send(
            new AdvancedResponse({
                data: {},
                message: 'Delete room successfully',
            }),
        );
    }
}

export default RoomController;
