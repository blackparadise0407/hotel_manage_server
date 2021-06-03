import { IReservation } from '@app/@types/global';
import mongoose, { Schema, SchemaDefinition } from 'mongoose';

const ReservationSchemaDefinition: SchemaDefinition<IReservation> = {
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
    created_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
};

const roomTypeSchema = new Schema(ReservationSchemaDefinition, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

export default mongoose.model<IReservation>('Reservation', roomTypeSchema);
