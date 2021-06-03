import { IReservation, IRoom, IRoute } from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import { includes, map } from 'lodash';
import Room from '../room/Room';
import Reservation from './Reservation';

class ReservationController extends AbstractController {
    path = '/reservation';
    routes: IRoute[] = [
        {
            path: '/get',
            method: Methods.GET,
            middleware: [auth],
            handler: this.getAll,
        },
        {
            path: '/create',
            method: Methods.POST,
            validationSchema: {
                check_in: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
                guests: {
                    in: 'body',
                    isArray: { errorMessage: 'is invalid' },
                },
                guest_id: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
                room_id: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
    ];
    protected async create({ body, user }: Request, res: Response) {
        // let aggregate: any[] = [];
        // const lookups: any[] = [
        //     {
        //         $lookup: {
        //             from: 'Reservation',
        //             localField: ''
        //         }
        //     }
        // ]
        const roomFilter: any = {
            status: 'V',
        };
        const vacanRoom = (await Room.find(roomFilter)) as IRoom[];
        const vacanRoomId: string[] = map(vacanRoom, (r: IRoom) =>
            r._id.toString(),
        );

        if (!includes(vacanRoomId, body['room_id'])) {
            throw new AdvancedError({
                message: 'Room is not empty',
                type: 'bad.request',
            });
        }

        body['created_by'] = user._id;
        const reservation = (await Reservation.create(body)) as IReservation;
        if (reservation) {
            await Room.updateOne(
                { _id: reservation.room_id },
                { $set: { status: 'OCC' } },
            );
        }
        res.send(
            new AdvancedResponse({
                data: reservation,
            }),
        );
    }
    protected async getAll(_req: Request, res: Response) {
        res.send(
            new AdvancedResponse({
                data: (await Reservation.find()) as IReservation[],
            }),
        );
    }
}

export default ReservationController;
