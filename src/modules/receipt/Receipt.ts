import { IReceipt } from '@app/@types/global';
import mongoose, { Schema } from 'mongoose';

const receiptSchema = new Schema(
    {
        total_amount: {
            type: Number,
            required: true,
        },
        check_out: {
            type: Date,
            required: true,
        },
        billing_setting_id: {
            type: Schema.Types.ObjectId,
            ref: 'BillingSetting',
            required: true,
        },
        reservation_id: {
            type: Schema.Types.ObjectId,
            ref: 'Reservation',
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

export default mongoose.model<IReceipt>('Receipt', receiptSchema);
