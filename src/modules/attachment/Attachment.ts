import { IAttachment } from '@app/@types/global';
import { AttachmentEnum } from '@app/typings/Enum';
import mongoose, { Schema } from 'mongoose';

const attachmentSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
        },
        url: {
            type: String,
        },
        category: {
            type: String,
            enum: [...AttachmentEnum],
            default: 'image',
        },
        size: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        versionKey: false,
    },
);

export default mongoose.model<IAttachment>('Attachment', attachmentSchema);
