import { IRoomType } from '@app/@types/global';
import mongoose, { Schema, SchemaDefinition } from 'mongoose';

const RoomTypeSchemaDefinition: SchemaDefinition<IRoomType> = {
    name: {
        type: String,
        required: true,
    },
    base_price: {
        type: Number,
        required: true,
    },
};

const roomTypeSchema = new Schema(RoomTypeSchemaDefinition, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});


export default mongoose.model<IRoomType>('RoomType', roomTypeSchema);