import { CLOUDINARY, UPLOAD } from '@app/config/index';
import AdvancedError from '@app/typings/AdvancedError';
import cloudinary, { ResourceApiOptions } from 'cloudinary';
import { unlinkSync } from 'fs';
import { flatten } from 'lodash';
import { Schema } from 'mongoose';
import multer, { FileFilterCallback, StorageEngine } from 'multer';


interface IUploadOptions {
    type:
    | 'image'
    | 'video';
}




// const TEMP_PATH = process.cwd() + `${process.env.NODE_ENV === 'development' ? '/src' : '/dist'}/temp`;

class UploadService {
    // public static generateFilename(file: Express.Multer.File) {

    // }
    /**
     * @param {Schema.Types.ObjectId} id Id of attachment record
     * @param {Express.Multer.File} file Multer file
     * @returns {string} Filename
     */
    private filenameTransform(id: Schema.Types.ObjectId, file: Express.Multer.File): string {
        const filename = file.originalname.split('.');
        filename.pop();
        return `${id}_${filename.join('.')}`;
    }

    private static generateFilename(file: Express.Multer.File): string {
        return `${Date.now()}.${file.originalname}`;
    }

    private static generatePath(type: string) {
        return process.cwd() + `${process.env.NODE_ENV === 'development' ? '/src' : '/dist'}/public/uploads/${type}`;
    }

    public static setUploader(options: IUploadOptions) {
        const storage: StorageEngine = multer.diskStorage({
            destination: (_req, _file, cb) => {
                cb(null, this.generatePath(options.type));
            },
            filename: (_req, file: Express.Multer.File, cb) => {
                cb(null, this.generateFilename(file));
            },
        });
        const fileFilter = (_req, file: Express.Multer.File, cb: FileFilterCallback) => {
            try {
                if (
                    !flatten(
                        Object.keys(UPLOAD.availableMime).map(
                            field => UPLOAD.availableMime[field],
                        ),
                    ).includes(file.mimetype)
                ) {
                    throw new AdvancedError({
                        message: 'Invalid file type',
                        type: 'multer.invalid',
                    });
                } else {
                    cb(null, true);
                    console.log(file);
                }
            } catch (e) {
                cb(e, false);
            }
        };
        const upload: multer.Multer = multer({
            storage,
            limits: {
                fileSize: UPLOAD.limits.fileSize[options.type],
                files: UPLOAD.limits.maxCount[options.type],
            },
            fileFilter,
        });
        return upload;
    }

    private cloudinary = cloudinary.v2;

    public async cloudUpload(id: Schema.Types.ObjectId, file: Express.Multer.File): Promise<string | undefined> {
        const _cloud = this.cloudinary;
        _cloud.config(CLOUDINARY);
        try {
            const options: ResourceApiOptions = {
                resource_type: 'image',
                public_id: `/home/images/${this.filenameTransform(id, file)}`,
                overwrite: false,
            };
            const { secure_url } = await _cloud.uploader.upload(file.destination + '/' + file.originalname, options);
            unlinkSync(file.destination + '/' + file.originalname);
            return secure_url;
        } catch (e) {
            throw new AdvancedError({
                message: e.message,
                type: 'cloudinary.error',
            });
        }
    }
}

export default UploadService;
