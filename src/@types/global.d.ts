import { NextFunction, Request, Response } from 'express';
import { Schema as ExpressValidatorSchema } from 'express-validator';
import mongoose, { Date, Types } from 'mongoose';
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
    next: NextFunction,
) => any;

export type IRole = 'manager' | 'employee';
export interface IUser extends mongoose.Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: IRole;
    // Methods:
    comparePassword: (str: string) => any;
    hasPermission: (pers: IRole[]) => boolean;
}

export interface IAttachment extends mongoose.Document {
    user_id: Types.ObjectId;
    name: string;
    url: string;
    size: number;
    category: 'image';
}

export type IHandler = (req: Request, res: Response, next: NextFunction) => any;

export interface ExpressValidatorError {
    msg?: string;
    location?: string;
    param?: string;
    value?: any;
}

export type GuestType = 'foreign' | 'domestic';

export interface IGuest extends mongoose.Document {
    full_name: string;
    id_no: string;
    address: string;
    guest_type: GuestType;
}
export interface IRoomType extends mongoose.Document {
    name: string;
    base_price: number;
}

export type RoomStatus = 'OCC' | 'V';
export interface IRoom extends mongoose.Document {
    name: string;
    number: number;
    room_name: string;
    floor: number;
    room_type: Types.ObjectId;
    status: RoomStatus;
}

export type ReservationStatus = 'active' | 'inactive';
export interface IReservation extends mongoose.Document {
    check_in: Date;
    check_out?: Date;
    guests: Types.ObjectId[];
    room_id: Types.ObjectId;
    guest_id: Types.ObjectId;
    billing_setting_id: Types.ObjectId;
    status: ReservationStatus;
    created_by: Types.ObjectId;
}

export interface IReceipt extends mongoose.Document {
    total_amount: number;
    check_out: Date;
    billing_setting_id: Types.ObjectId;
    reservation_id: Types.ObjectId;
    created_by: Types.ObjectId;
}

export type BillingSettingStatus = 'active' | 'inactive';
export interface IBillingSetting extends mongoose.Document {
    foreign_guest_coefficient: number;
    third_guest_percentage: number;
    status: BillingSettingStatus;
    created_by: Types.ObjectId;
}
