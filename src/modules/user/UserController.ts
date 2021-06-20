import { IRoute, IUser } from '@app/@types/global';
import { auth } from '@app/services';
import { sendForgetPasswordMail } from '@app/services/Mailer';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { hasRole } from '@app/utils';
import { Request, Response } from 'express';
import { User } from '..';

class UserController extends AbstractController {
    path = '/user';
    routes: IRoute[] = [
        {
            path: '/info',
            method: Methods.GET,
            middleware: [auth],
            handler: this.info,
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
                email: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isEmail: {
                        errorMessage: 'is invalid',
                    },
                },
                username: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
                password: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
                role: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
            },
            middleware: [auth],
            handler: this.createAccount,
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
            handler: this.deleteUser,
        },
    ];

    protected async info(req: Request, res: Response): Promise<void> {
        let user = req.user as IUser;
        user = (await User.findById(user._id)) as IUser;
        res.send(
            new AdvancedResponse({
                data: user,
            }),
        );
    }

    protected async forgetPassword(req: Request, res: Response): Promise<void> {
        const { email } = req.body;

        const existedUser = (await User.findOne({ email })) as IUser;
        if (!existedUser) {
            throw new AdvancedError({
                message: 'User not found',
                type: 'not.found',
            });
        }
        await sendForgetPasswordMail(existedUser.email, []);
        res.send(
            new AdvancedResponse({
                data: {},
                message: 'Email has been sent',
            }),
        );
    }

    protected async getAll({ user }: Request, res: Response): Promise<void> {
        hasRole(user, ['manager']);
        const employee = (await User.find().sort({
            created_at: -1,
        })) as IUser[];
        res.send(
            new AdvancedResponse({
                data: employee,
            }),
        );
    }

    protected async createAccount(
        { user, body }: Request,
        res: Response,
    ): Promise<void> {
        hasRole(user, ['manager']);
        const { email, password, username, role } = body;
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            throw new AdvancedError({
                message: 'This email has been registered',
                type: 'invalid',
            });
        }
        const newUser = new User({
            username,
            email,
            password,
            role,
        });
        const savedUser: IUser = await newUser.save();
        res.send(
            new AdvancedResponse({
                data: savedUser,
            }),
        );
    }

    protected async deleteUser(
        { user, params }: Request,
        res: Response,
    ): Promise<void> {
        hasRole(user, ['manager']);
        const { id } = params;
        const existedUser = await User.findById(id);
        if (!existedUser) {
            throw new AdvancedError({
                message: 'User does not exist',
                type: 'not.found',
            });
        }
        if (existedUser._id.toString() === user._id.toString()) {
            throw new AdvancedError({
                message: 'Invalid request',
                type: 'invalid',
            });
        }
        await User.deleteOne({ _id: id });
        res.send(
            new AdvancedResponse({
                data: {},
                message: 'Delete user successfully',
            }),
        );
    }
}

export default UserController;
