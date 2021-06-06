import { IBillingSetting } from '@app/@types/global';
import { BillingSettingStatusEnum } from '@app/typings/Enum';
import { model, Schema } from 'mongoose';

const billingSettingSchema = new Schema(
    {
        foreign_guest_coefficient: {
            type: Number,
            required: true,
        },
        third_guest_percentage: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [...BillingSettingStatusEnum],
            default: 'active',
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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

export default model<IBillingSetting>('BillingSetting', billingSettingSchema);
