import { IRoute } from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import { map, reduce } from 'lodash';
import moment from 'moment';
import Receipt from '../receipt/Receipt';

class AnalyticController extends AbstractController {
    path = '/analytic';
    routes: IRoute[] = [
        {
            path: '/revenue-by-room-type',
            method: Methods.GET,
            validationSchema: {
                from_date: {
                    in: 'query',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
                to_date: {
                    in: 'query',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.revenueByRoomType,
        },
        {
            path: '/frequency-by-room',
            method: Methods.GET,
            validationSchema: {
                selected_date: {
                    in: 'query',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: { errorMessage: 'is invalid' },
                },
            },
            middleware: [auth],
            handler: this.frequencyByRoom,
        },
    ];

    protected async revenueByRoomType(
        { query }: Request,
        res: Response,
    ): Promise<void> {
        let { from_date, to_date }: any = query;
        from_date = parseInt(from_date, 10);
        to_date = parseInt(to_date, 10);
        let aggregates: any = [];
        const startDate = moment(from_date).utc().toDate();
        const endDate = moment(to_date).utc().toDate();
        const matches = {
            $match: {
                created_at: {
                    $lt: endDate,
                    $gt: startDate,
                },
            },
        };
        aggregates.push(matches);
        const lookups: any = [
            {
                $lookup: {
                    from: 'reservations',
                    localField: 'reservation_id',
                    foreignField: '_id',
                    as: 'reservation_id',
                },
            },
            {
                $unwind: {
                    path: '$reservation_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'reservation_id.room_id',
                    foreignField: '_id',
                    as: 'reservation_id.room_id',
                },
            },
            {
                $unwind: {
                    path: '$reservation_id.room_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'roomtypes',
                    localField: 'reservation_id.room_id.room_type',
                    foreignField: '_id',
                    as: 'reservation_id.room_id.room_type',
                },
            },
            {
                $unwind: {
                    path: '$reservation_id.room_id.room_type',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const group = [
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        dayOfMonth: { $dayOfMonth: '$created_at' },
                        room_type: '$reservation_id.room_id.room_type.name',
                    },
                    created_at: { $first: '$created_at' },
                    total: { $sum: '$total_amount' },
                },
            },
        ];
        const project = {
            $project: {
                _id: 1,
                reservation_id: {
                    room_id: {
                        room_type: {
                            name: 1,
                        },
                    },
                },
                total_amount: 1,
                created_at: 1,
                total: 1,
            },
        };

        aggregates = [...aggregates, ...lookups, ...group, project];
        const receipts = await Receipt.aggregate(aggregates);
        const results: any = map(receipts, (r: any) => {
            return {
                date: moment(r.created_at).format('DD/MM/YYYY'),
                value: r.total,
                room_type: r._id.room_type,
            };
        });
        res.send(
            new AdvancedResponse({
                data: results,
            }),
        );
    }

    protected async frequencyByRoom(
        { query }: Request,
        res: Response,
    ): Promise<void> {
        let { selected_date }: any = query;
        selected_date = parseInt(selected_date, 10);
        const startDate = moment(selected_date).startOf('month').utc().toDate();
        const endDate = moment(selected_date)
            .clone()
            .endOf('month')
            .utc()
            .toDate();
        console.log(startDate, endDate);
        let aggregates: any = [];
        const matches = {
            $match: {
                $and: [
                    {
                        created_at: {
                            $gte: startDate,
                            $lte: endDate,
                        },
                    },
                ],
            },
        };
        aggregates.push(matches);
        const lookups = [
            {
                $lookup: {
                    from: 'reservations',
                    localField: 'reservation_id',
                    foreignField: '_id',
                    as: 'reservation_id',
                },
            },
            {
                $unwind: {
                    path: '$reservation_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'reservation_id.room_id',
                    foreignField: '_id',
                    as: 'reservation_id.room_id',
                },
            },
            {
                $unwind: {
                    path: '$reservation_id.room_id',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];
        const group = {
            $group: {
                _id: {
                    year: { $year: '$created_at' },
                    month: { $month: '$created_at' },
                    // dayOfMonth: { $dayOfMonth: '$created_at' },
                    room_name: '$reservation_id.room_id.room_name',
                },
                room: {
                    $push: '$reservation_id',
                },
            },
        };
        const project = {
            $project: {
                _id: 1,
                reservation_id: {
                    room_id: {
                        room_name: 1,
                    },
                    check_in: 1,
                },
                room: {
                    _id: 1,
                    check_in: 1,
                    check_out: 1,
                },

                total: 1,

                check_out: 1,
                created_at: 1,
            },
        };
        aggregates = [...aggregates, ...lookups, group, project];
        const receipts = await Receipt.aggregate(aggregates);
        const results = map(receipts, (r: any) => {
            const duration = reduce(
                r.room,
                (result: number, curr: any) => {
                    const _dur = moment(curr.check_out).diff(
                        moment(curr.check_in),
                        'day',
                    );
                    return (result += _dur);
                },
                0,
            );
            return {
                room_name: r._id.room_name,
                month: r._id.month,
                duration,
            };
        });

        res.send(
            new AdvancedResponse({
                data: results,
            }),
        );
    }
}

export default AnalyticController;
