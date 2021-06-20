import { IRoute, IUser } from '@app/@types/global';
import { User } from '@app/modules';
import AbstractController from '@app/typings/AbstractController';
import AdvancedError from '@app/typings/AdvancedError';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { Methods } from '@app/typings/Enum';
import { tokenGen, validateToken } from '@app/utils';
import { Request, Response } from 'express';

class AuthController extends AbstractController {
    path = '/auth';
    routes: IRoute[] = [
        {
            path: '/login',
            method: Methods.POST,
            validationSchema: {
                email: {
                    in: ['body'],
                    isString: {
                        errorMessage: 'is invalid',
                    },
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                },
                password: {
                    in: ['body'],
                    isString: {
                        errorMessage: 'is invalid',
                    },
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                },
            },
            middleware: [],
            handler: this.login,
        },
        {
            path: '/register',
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
            },
            middleware: [],
            handler: this.register,
        },
        {
            path: '/refresh-token',
            method: Methods.POST,
            middleware: [],
            handler: this.refreshToken,
        },
    ];
    constructor() {
        super();
    }

    private async register(req: Request, res: Response) {
        const { email, password, username } = req.body;
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
        });
        const savedUser: IUser = await newUser.save();
        const accessToken: string = tokenGen(savedUser);
        const refreshTk: string = tokenGen(savedUser, 'refresh');
        res.send(
            new AdvancedResponse({
                data: {
                    user: savedUser,
                    accessToken,
                    refreshToken: refreshTk,
                },
            }),
        );
    }

    private async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const existedUser = (await User.findOne({ email })) as IUser;
        if (!existedUser) {
            throw new AdvancedError({
                message: 'User not found',
                type: 'not.found',
            });
        }

        const match = await existedUser.comparePassword(password);
        if (!match) {
            throw new AdvancedError({
                message: 'Invalid credentials',
                type: 'invalid',
            });
        }

        const accessToken: string = tokenGen(existedUser);
        const refreshTk: string = tokenGen(existedUser, 'refresh');

        res.send(
            new AdvancedResponse({
                data: {
                    user: existedUser,
                    accessToken,
                    refreshToken: refreshTk,
                },
            }),
        );
    }

    private async refreshToken(req: Request, res: Response) {
        const { refreshToken: token } = req.body;

        const { _id }: any = validateToken(token, 'refresh');
        const user = await User.findById(_id);
        if (!user) {
            throw new AdvancedError({
                message: 'User not found!',
                type: 'not.found',
            });
        }
        const accessToken = tokenGen(user);
        res.send(
            new AdvancedResponse({
                data: {
                    accessToken,
                },
            }),
        );
    }
}

export default AuthController;
