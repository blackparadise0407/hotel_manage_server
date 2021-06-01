import { IRoute, IUser } from '@app/@types/global';
import { auth } from '@app/services';
import { sendForgetPasswordMail } from '@app/services/Mailer';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import { User } from '..';

class UserController extends AbstractController {
    path = '/user';
    routes: IRoute[] = [
        {
            path: '/info',
            method: Methods.GET,
            middleware: [auth],
            handler: this.get,
        },
        {
            path: '/forget-password',
            method: Methods.POST,
            validationSchema: {
                email: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isEmail: {
                        errorMessage: 'is invalid',
                    },
                },
            },
            middleware: [],
            handler: this.forgetPassword,
        },
    ];

    private async get(req: Request, res: Response, next) {

        let user = req.user as IUser;
        user = await User.findById(user._id) as IUser;
        res.send(new AdvancedResponse({
            data: user,
        }));

    }

    private async forgetPassword(req: Request, res: Response, next) {
        const { email } = req.body;

        const existedUser = await User.findOne({ email }) as IUser;
        if (!existedUser) {
            throw new AdvancedError({
                message: 'User not found',
                type: 'not.found',
            });
        }
        await sendForgetPasswordMail(existedUser.email, []);
        res.send(new AdvancedResponse({
            data: {},
            message: 'Email has been sent',
        }));

    }


}

export default UserController;