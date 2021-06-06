import { IGuest } from '@app/@types/global';
import { GuestTypeEnum } from '@app/typings/Enum';
import mongoose, { Schema } from 'mongoose';

const guestSchema = new Schema(
    {
        full_name: {
            type: String,
            required: true,
        },
        id_no: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        guest_type: {
            type: String,
            enum: [...GuestTypeEnum],
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

export default mongoose.model<IGuest>('Guest', guestSchema);
