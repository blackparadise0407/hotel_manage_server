import { IMiddleware } from '@app/@types/global';
import { connectDB, errHandler, notFound } from '@app/services';
import AbstractController from '@app/typings/AbstractController';
import chalk from 'chalk';
import { Application } from 'express';
import { forEach } from 'lodash';



export default class App {
    private _app: Application;
    private readonly _port: number | string;

    constructor(app: Application, port: number | string) {
        this._app = app;
        this._port = port;
    }

    public run() {
        return this._app.listen(this._port, () => {
            console.log(
                chalk.yellowBright.italic(`
            **************************************************************
            *  🚀🚀 Server started on port ${this._port} in ${process.env.NODE_ENV} mode 🚀🚀 *
            **************************************************************
            `));
        });
    }

    public loadGlobalMiddleware(middleware: IMiddleware[] | any): void {
        middleware.forEach(mw => {
            this._app.use(mw);
        });
    }

    public loadControllers(controllers: AbstractController[]): void {
        forEach(controllers, (c: AbstractController) => {
            // use setRoutes method that maps routes and returns Router object
            this._app.use(c.path, c.returnRoutes());
        });
    }

    public initDatabase(): any {
        connectDB(`${process.env.DB_URL}`);
    }

    private registerHandler(handler: any): any { return handler; }

    public handleError(): void {
        this._app.use(this.registerHandler(notFound));
        this._app.use(this.registerHandler(errHandler));
    }

}