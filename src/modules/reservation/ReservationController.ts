import {
    IBillingSetting,
    IGuest,
    IReservation,
    IRoom,
    IRoute,
} from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { filterParams } from '@app/utils';
import { Request, Response } from 'express';
import { includes, map } from 'lodash';
import BillingSetting from '../billing-setting/BillingSetting';
import Guest from '../guest/Guest';
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
                room_id: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
        {
            path: '/update-by-id',
            method: Methods.POST,
            validationSchema: {
                _id: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isString: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.updateById,
        },
        {
            path: '/delete-by-id/:id',
            method: Methods.DELETE,
            middleware: [auth],
            handler: this.deleteById,
        },
    ];

    // Create reservation only vancan room
    protected async create(
        { body, user }: Request,
        res: Response,
    ): Promise<void> {
        const roomFilter: any = {
            status: 'V',
        };
        const vacantRoom = (await Room.find(roomFilter)) as IRoom[];
        const vacantRoomId: string[] = map(vacantRoom, (r: IRoom) =>
            r._id.toString(),
        );

        if (!includes(vacantRoomId, body['room_id'])) {
            throw new AdvancedError({
                message: 'Room is not empty',
                type: 'bad.request',
            });
        }

        // Creating guests

        const insertedGuest = [...body['guests']];
        const guests = (await Guest.insertMany(insertedGuest)) as IGuest[];
        const guestId = guests[0]._id;
        body['guest_id'] = guestId;
        body['guests'] = map(guests, (i) => i._id);

        const billingSettings = (await BillingSetting.find({
            status: 'active',
        })) as IBillingSetting[];
        if (!billingSettings.length) {
            throw new AdvancedError({
                message: 'No billing setting found',
                type: 'not.found',
            });
        }
        body['created_by'] = user._id;
        body['billing_setting_id'] = billingSettings[0]._id;
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
    protected async getAll(_req: Request, res: Response): Promise<void> {
        const aggregates: any = [
            {
                $lookup: {
                    from: 'guests',
                    localField: 'guest_id',
                    foreignField: '_id',
                    as: 'guest_id',
                },
            },
            {
                $unwind: {
                    path: '$guest_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'receipts',
                    localField: '_id',
                    foreignField: 'reservation_id',
                    as: 'receipts',
                },
            },
            {
                $unwind: {
                    path: '$receipts',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room_id',
                    foreignField: '_id',
                    as: 'room_id',
                },
            },
            {
                $unwind: {
                    path: '$room_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'roomtypes',
                    localField: 'room_id.room_type',
                    foreignField: '_id',
                    as: 'room_id.room_type',
                },
            },
            {
                $unwind: {
                    path: '$room_id.room_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    room_id: {
                        _id: 1,
                        room_name: 1,
                        room_type: {
                            name: 1,
                        },
                    },
                    receipts: {
                        check_out: 1,
                        total_amount: 1,
                    },
                    guest_id: {
                        full_name: 1,
                    },
                    check_out: 1,
                    check_in: 1,
                    updated_at: 1,
                    created_at: 1,
                },
            },
            {
                $sort: { updated_at: -1 },
            },
        ];
        const resp = await Reservation.aggregate(aggregates);
        res.send(
            new AdvancedResponse({
                data: resp,
            }),
        );
        // res.send(
        //     new AdvancedResponse({
        //         data: (await Reservation.find()
        //             .populate('guest_id')
        //             .populate('room_id')
        //             .sort({ updated_at: -1 })) as IReservation[],
        //     }),
        // );
    }
    // Get reservation by id
    protected async updateById(req: Request, res: Response): Promise<void> {
        const { body } = req;
        const { room_id, _id }: IReservation = body;
        filterParams(body, ['created_by']);
        const reservation = (await Reservation.findById(_id)) as IReservation;
        if (!reservation) {
            throw new AdvancedError({
                message: 'Reservation does not exist',
                type: 'not.found',
            });
        }
        if (reservation.room_id.toString() === room_id.toString()) {
            console.log('why else not if');
            await Reservation.updateOne(
                { _id: reservation._id },
                { $set: { ...reservation } },
            );
        } else {
            const roomFilter: any = {
                status: 'V',
            };
            const vacantRoom = (await Room.find(roomFilter)) as IRoom[];
            const vacantRoomId: string[] = map(vacantRoom, (r: IRoom) =>
                r._id.toString(),
            );
            if (!includes(vacantRoomId, room_id.toString())) {
                throw new AdvancedError({
                    message: 'Room is not empty',
                    type: 'bad.request',
                });
            }
            await Reservation.updateOne(
                { _id: reservation._id },
                { $set: { ...reservation } },
            );
            await Room.updateOne(
                { _id: reservation.room_id },
                { $set: { status: 'V' } },
            );
            await Room.updateOne({ _id: room_id }, { $set: { status: 'OCC' } });
        }
        res.send(
            new AdvancedResponse({
                data: {},
            }),
        );
    }
    // delete reservation by id
    protected async deleteById({ params }: Request, res: Response) {
        const { id } = params;
        const reservation = (await Reservation.findById(id)) as IReservation;
        if (!reservation) {
            throw new AdvancedError({
                message: 'Reservation does not exist',
                type: 'not.found',
            });
        }
        await Reservation.deleteOne({ _id: id });

        await Room.updateOne(
            { _id: reservation.room_id },
            { $set: { status: 'V' } },
        );
        res.send(
            new AdvancedResponse({
                data: {},
            }),
        );
    }
}

export default ReservationController;
