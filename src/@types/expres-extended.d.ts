import { Request } from "express"
import { IUser } from "./global";
declare module "express" {
    export interface Request {
        user: IUser
    }
}