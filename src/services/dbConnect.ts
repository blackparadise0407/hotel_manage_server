import chalk from 'chalk';
import { connect, ConnectionOptions } from 'mongoose';

const connectDB = async (uri: string) => {
    try {
        console.log(chalk.blueBright('Connecting...'));
        const options: ConnectionOptions = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        };
        await connect(uri, options);
        console.log(chalk.cyan.italic('==> Successfully established a connection to the database <=='));
    } catch (err) {
        console.log(chalk.bgRedBright.white(err.message));
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;