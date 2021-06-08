import { IRole, IUser } from '@app/@types/global';
import { BCRYPT_SALT_WORKER, TOKEN_CONFIG } from '@app/config';
import AdvancedError from '@app/typings/AdvancedError';
import * as genHTML from '@app/utils/genHTML';
import bcryptjs from 'bcryptjs';
import { Request, Response } from 'express';
import fs from 'fs';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { forEach, includes } from 'lodash';
import path from 'path';

export const stringHash = async (str: string): Promise<string> => {
    try {
        const salt = await bcryptjs.genSalt(BCRYPT_SALT_WORKER);
        const hashedString = await bcryptjs.hash(str, salt);
        return hashedString;
    } catch (error) {
        throw new AdvancedError({
            message: error.message,
            type: 'bcrypt.error',
        });
    }
};

export const tokenGen = (
    { email, _id, role }: IUser,
    type: 'access' | 'refresh' = 'access',
): string => {
    const options: SignOptions = {
        expiresIn: TOKEN_CONFIG.access.expire, // 1 hour
    };
    // const keyPem = fs.readFileSync();
    const rootDir = path.dirname(__dirname);
    const keyPem = fs.readFileSync(path.join(rootDir, '/.ssh/jwtRS256.key'));
    if (type === 'refresh') {
        options.algorithm = 'RS256';
        options.expiresIn = TOKEN_CONFIG.refresh.expire; // 8 hours
    }
    return jwt.sign(
        { _id, email, role },
        `${type === 'refresh' ? keyPem : process.env.JWT_KEY}`,
        options,
    );
};

export const validateToken = (
    token: string,
    type: 'refresh' | 'access' = 'access',
) => {
    try {
        const rootDir = path.dirname(__dirname);
        const keyPem = fs.readFileSync(
            path.join(rootDir, '/.ssh/jwtRS256.key'),
        );
        const opt: VerifyOptions = {};
        if (type === 'refresh') {
            opt.algorithms = ['RS256'];
        }
        const decoded = jwt.verify(
            token,
            type === 'refresh' ? keyPem : `${process.env.JWT_KEY}`,
            opt,
        );
        return decoded;
    } catch (error) {
        const err = new AdvancedError({
            message: error.message,
            type: 'jwt.error',
        });
        if (error.message === 'jwt expired') err.setStatusCode(401);
        throw err;
    }
};

export const catchAsync =
    (fn: any) => (req: Request, res: Response, next: any) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err));
    };

export { genHTML };

export const hasRole = (user: IUser, roles: IRole[]): void => {
    if (!includes(roles, user.role)) {
        const error = new AdvancedError({
            message: 'User does not have permission',
            type: 'not.permission',
        });
        error.setStatusCode(403);
        throw error;
    }
};

export const filterParams = (obj: any, p: string[]) => {
    const cloneObj = { ...obj };
    forEach(p, (s) => {
        delete obj[s];
    });
    return cloneObj;
};
