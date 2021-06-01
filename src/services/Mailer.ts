import { HOST } from '@app/config';
import { genHTML as HTMLGenerator } from '@app/utils';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

class MailerService {
    private to: string;
    private cc: string[];
    private subject: string;
    private transporter: Mail;
    private html: any;
    private mailGenerator: Mailgen;
    public initTransport() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });
        return this;
    }

    private initMailGenerator() {
        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Instagram',
                link: 'asdasd',
            },
        });
        return this;
    }

    public init(subject: string, to: string, cc: string[]) {
        this.to = to;
        this.cc = cc;
        this.subject = subject;
        this.initTransport();
        this.initMailGenerator();
        return this;
    }

    public createContent(content: Mailgen.Content) {
        this.html = this.mailGenerator.generate(content);
        return this;
    }

    public createContentHTML({ content, style }: { content: any, style?: any }) {
        this.html = HTMLGenerator.genHTML({ style, content });
        return this;
    }

    public send({ attachments = [] }: any = {}) {
        const { subject, to, cc, html } = this;
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(
                {
                    from: HOST.url,
                    to,
                    cc,
                    subject,
                    attachments,
                    html,
                },
                err => (err ? reject(err) : resolve(true)),
            );
        });
    }

}

export default MailerService;

export function sendForgetPasswordMail(
    to: string,
    cc: string[] = [],
) {
    const subject = HOST.name + ' - ' + 'Forget email';
    const mailer = new MailerService();
    const content: Mailgen.Content = {
        body: {
            name: to,
            action: {
                instructions: 'Click here',
                button: {
                    color: '#aea',
                    text: 'Sign up',
                    link: '/api/redirect/signup',
                },
            },
        },
    };
    // mailer.init(subject, to, cc).createContentHTML({
    //     content: HTMLGenerator.genForgetPasswordMail({}),
    // });
    mailer.init(subject, to, cc).createContent(content);
    return mailer.send();
}