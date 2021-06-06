import { IReservation } from '@app/@types/global';
import { ReservationStatusEnum } from '@app/typings/Enum';
import mongoose, { Schema } from 'mongoose';

const roomTypeSchema = new Schema(
    {
        check_in: {
            type: Date,
            required: true,
        },
        guests: [
            {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Guest',
            },
        ],
        guest_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Guest',
        },
        room_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Room',
        },
        billing_setting_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'BillingSetting',
        },
        created_by: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            enum: [...ReservationStatusEnum],
            required: true,
            default: 'active',
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

export default mongoose.model<IReservation>('Reservation', roomTypeSchema);
