import { NextFunction, Request, Response } from "express";
import { Schema as ExpressValidatorSchema } from "express-validator";
import mongoose, { Types } from "mongoose";
export interface IRoute {
    path: string;
    method: Methods;
    validationSchema?: ExpressValidatorSchema;
    // permission?: IRole[];
    middleware: IMiddleware[] | any[];
    handler: IHandler;
}

export type IMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => any;

export type IRole = "superadmin" | "customer";
export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: IRole;
    createdAt: Date;
    updatedAt: Date;
    // Methods:
    comparePassword: (str: string) => any;
    hasPermission: (pers: IRole[]) => boolean;
}

export interface IAttachment extends mongoose.Document {
    user_id: Types.ObjectId;
    name: string;
    url: string;
    size: number;
    category: "image";
    createdAt: Date;
    updatedAt: Date;
}

export type IHandler = (req: Request, res: Response, next: NextFunction) => any;

export interface ExpressValidatorError {
    msg?: string;
    location?: string;
    param?: string;
    value?: any;
}

