import { IRole } from '@app/@types/global';

export enum Methods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

export const AttachmentEnum = ['image'];

export const UserRoleEnum: IRole[] = ['superadmin', 'customer'];