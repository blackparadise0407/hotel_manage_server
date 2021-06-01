import { errHandler, notFound } from '@app/services/ErrorHandler';
import MailService from '@app/services/Mailer';
import UploadService from '@app/services/Upload';
import auth from '@app/services/auth';
import connectDB from '@app/services/dbConnect';

export {
    connectDB,
    auth,
    notFound,
    errHandler,
    UploadService,
    MailService,
};