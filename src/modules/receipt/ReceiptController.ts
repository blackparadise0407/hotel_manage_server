import {
    IBillingSetting,
    IReservation,
    IRoom,
    IRoute,
} from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import { map, some } from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import BillingSetting from '../billing-setting/BillingSetting';
import Guest from '../guest/Guest';
import Reservation from '../reservation/Reservation';
import Room from '../room/Room';
import Receipt from './Receipt';

class ReceiptController extends AbstractController {
    path = '/receipt';
    routes: IRoute[] = [
        {
            path: '/create',
            method: Methods.POST,
            validationSchema: {
                check_out: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
    ];

    protected async create({ body }: Request, res: Response) {
        const { reservation_id, check_out, room_id } = body;
        let reservation: IReservation;
        if (!reservation_id) {
            reservation = await Reservation.findOne({ room_id });
        } else {
            reservation = (await Reservation.findById(
                reservation_id,
            )) as IReservation;
        }
        if (!reservation) {
            throw new AdvancedError({
                message: 'Reservation not found',
                type: 'not.found',
            });
        }
        const billingSetting = (await BillingSetting.findById(
            reservation.billing_setting_id,
        )) as IBillingSetting;
        if (!billingSetting) {
            throw new AdvancedError({
                message: 'Billing setting not found',
                type: 'not.found',
            });
        }
        const room = (await Room.findById(reservation.room_id).populate(
            'room_type',
        )) as IRoom & any;
        if (!Room) {
            throw new AdvancedError({
                message: 'Room not found',
                type: 'not.found',
            });
        }
        const check_in: any = reservation.check_in;
        const duration: number =
            moment(check_out).diff(moment(check_in), 'days') + 1;

        let totalPrice: number = room.room_type.base_price * duration;
        const guestFilter: any = map(reservation.guests, (g: string) =>
            Types.ObjectId(g),
        );
        const guests = await Guest.find(
            { _id: { $in: guestFilter } },
            { _id: true, guest_type: true },
        );
        if (some(guests, ['guest_type', 'foreign'])) {
            totalPrice = totalPrice * billingSetting.foreign_guest_coefficient;
        }
        if (guests.length >= 3) {
            totalPrice +=
                (room.room_type.base_price *
                    duration *
                    billingSetting.third_guest_percentage) /
                100;
        }

        const receipt = new Receipt({
            total_amount: totalPrice,
            check_out,
            reservation_id: reservation._id,
            billing_setting_id: reservation.billing_setting_id,
        });

        await receipt.save();
        await Room.updateOne(
            { _id: reservation.room_id },
            { $set: { status: 'V' } },
        );
        await Reservation.updateOne(
            { _id: reservation._id },
            { $set: { status: 'inactive' } },
        );

        res.send(
            new AdvancedResponse({
                data: receipt,
            }),
        );
    }
}

export default ReceiptController;
