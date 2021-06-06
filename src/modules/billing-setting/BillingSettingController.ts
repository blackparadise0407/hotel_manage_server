import { IRoute } from '@app/@types/global';
import { auth } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { hasRole } from '@app/utils';
import { Request, Response } from 'express';
import BillingSetting from './BillingSetting';

class BillingSettingController extends AbstractController {
    path = '/billing-setting';
    routes: IRoute[] = [
        {
            path: '/create',
            method: Methods.POST,
            validationSchema: {
                foreign_guest_coefficient: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: {
                        errorMessage: 'is invalid',
                    },
                },
                third_guest_percentage: {
                    in: 'body',
                    notEmpty: { errorMessage: 'is required' },
                    isNumeric: {
                        errorMessage: 'is invalid',
                    },
                },
            },
            middleware: [auth],
            handler: this.create,
        },
    ];
    protected async create({ user, body }: Request, res: Response) {
        hasRole(user, ['manager']);
        body['created_by'] = user._id;
        const billingSetting = await BillingSetting.create(body);
        res.send(
            new AdvancedResponse({
                data: billingSetting,
            }),
        );
    }
}

export default BillingSettingController;
