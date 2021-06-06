import { IRoomType } from '@app/@types/global';
import mongoose, { Schema } from 'mongoose';

const roomTypeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        base_price: {
            type: Number,
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

export default mongoose.model<IRoomType>('RoomType', roomTypeSchema);
