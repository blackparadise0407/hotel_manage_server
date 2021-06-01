import { IAttachment, IRoute, IUser } from '@app/@types/global';
import { auth, UploadService } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import AdvancedResponse from '@app/typings/AdvancedResponse';
import { AttachmentEnum, Methods } from '@app/typings/Enum';
import { Request, Response } from 'express';
import Attachment from './Attachment';


class AttachmentController extends AbstractController {
    path: string = '/attachment';
    routes: IRoute[] = [
        {
            path: '/cloud-upload',
            method: Methods.POST,
            validationSchema: {
                name: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isString: {
                        errorMessage: 'is invalid',
                    },
                },
                category: {
                    in: ['body'],
                    notEmpty: {
                        errorMessage: 'is required',
                    },
                    isIn: {
                        options: [AttachmentEnum],
                        errorMessage: 'is invalid',
                    },
                },
            },
            middleware: [auth, UploadService.setUploader({ type: 'image' }).single('image')],
            handler: this.uploadSingle,
        },
    ];

    private async uploadSingle(req: Request, res: Response) {
        const { name, category } = req.body;
        const { file } = req;
        const user: IUser = req.user;

        const upload = new UploadService();
        const newFile: IAttachment = new Attachment({
            name,
            user_id: user,
            category,
            size: file.size,
        });
        const { _id } = await newFile.save();
        const path = await upload.cloudUpload(_id, file);
        if (path) {
            newFile.url = path;
        }
        await newFile.save();
        res.send(new AdvancedResponse({
            data: newFile,
        }));

    }
}

export default AttachmentController;