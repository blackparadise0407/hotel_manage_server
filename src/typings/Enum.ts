import {
    BillingSettingStatus,
    GuestType,
    IRole,
    ReservationStatus,
    RoomStatus,
} from '@app/@types/global';

export enum Methods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

export const AttachmentEnum = ['image'];

export const UserRoleEnum: IRole[] = ['manager', 'employee'];

export const RoomStatusEnum: RoomStatus[] = ['V', 'OCC'];

export const GuestTypeEnum: GuestType[] = ['domestic', 'foreign'];

export const ReservationStatusEnum: ReservationStatus[] = [
    'active',
    'inactive',
];

export const BillingSettingStatusEnum: BillingSettingStatus[] = [
    'active',
    'inactive',
];
