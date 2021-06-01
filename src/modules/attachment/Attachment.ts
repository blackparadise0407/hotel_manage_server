import { IAttachment } from '@app/@types/global';
import { AttachmentEnum } from '@app/typings/Enum';
import mongoose, { Schema, SchemaDefinition } from 'mongoose';

const attachmentSchemaDefinition: SchemaDefinition = {
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
};

const attachmentSchema = new Schema(attachmentSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model<IAttachment>('Attachment', attachmentSchema);

