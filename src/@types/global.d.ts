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

export type IRole = "manager" | "employee";
export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: IRole;
    created_at: Date;
    updated_at: Date;
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
    created_at: Date;
    updated_at: Date;
}

export type IHandler = (req: Request, res: Response, next: NextFunction) => any;

export interface ExpressValidatorError {
    msg?: string;
    location?: string;
    param?: string;
    value?: any;
}

export interface IRoomType extends mongoose.Document {
    name: string;
    base_price: number;
    created_at: Date;
    updated_at: Date;
}

export type RoomStatus = "OCC" | "V"
export interface IRoom extends mongoose.Document {
    name: string;
    number: number;
    floor: number;
    room_type: Types.ObjectId;
    status: RoomStatus;
    created_at: Date;
    updated_at: Date;
}

export interface IReservation extends mongoose.Document {
    check_in: Date;
    check_out: Date;
    guests: Types.ObjectId[];
    room_id: Types.ObjectId;
    guest_id: Types.ObjectId;
}

export interface IPayment extends mongoose.Document {
    total_amout: float;
    billing_setting_id: Types.ObjectId;
    reservation_id: Types.ObjectId;
    guest_id: Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}