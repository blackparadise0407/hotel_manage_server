import { IRoom } from '@app/@types/global';
import { RoomStatusEnum } from '@app/typings/Enum';
import mongoose, { Schema, SchemaDefinition } from 'mongoose';

const RoomSchemaDefinition: SchemaDefinition<IRoom> = {
    number: {
        type: Number,
        required: true,
    },
    floor: {
        type: Number,
        required: true,
    },
    room_type: {
        type: Schema.Types.ObjectId,
        ref: 'RoomType',
        required: true,
    },
    status: {
        type: String,
        enum: [...RoomStatusEnum],
        default: 'V',
    },
};

const roomSchema = new Schema(RoomSchemaDefinition, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

// tslint:disable-next-line: only-arrow-functions
roomSchema.virtual('room_name').get(function (this: { floor: number; number: number }) {
    return `${this.floor}${String('0' + this.number).slice(-2)}`;
});

roomSchema.set('toObject', {
    virtuals: true, transform: (_room: IRoom, ret: { [key: string]: any }) => {
        delete ret.id;
    }
    ,
});
roomSchema.set('toJSON', {
    virtuals: true, transform: (_room: IRoom, ret: { [key: string]: any }) => {
        delete ret.id;
    }
    ,
});

export default mongoose.model<IRoom>('Room', roomSchema);