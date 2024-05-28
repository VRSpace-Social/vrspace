import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import { format } from 'date-fns';

let dateNow: Date = new Date();
let dateStamp: string = format(dateNow, "yyyy-MM-dd H-mm-ss");

export class LogManager {
    logger: any;
    debugType: string;
    logDir: string;
    logFilePath: string;
    logFileName: string;
    logApp: string

    constructor(debugType: string, logApp?: string) {
        this.logger = null;
        this.debugType = debugType;
        this.logDir = '';
        this.logFilePath = '';
        if(!logApp) 
            logApp = 'VRSPACE';
        this.logApp = logApp;
        this.logFileName = util.format('%s_%s.log', logApp, dateStamp);
        this.checkLogDirectory();
    }

    checkLogDirectory(): void {
        const currentDirectory = process.cwd();

        if(this.debugType) {
            // If debug mode is enabled, set logDir to current directory
            this.logDir = path.join(currentDirectory, 'logs');
        } else {
            this.logDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/tmp') || (process.platform === 'linux' ? process.env.HOME + '/.local/share' : '/tmp/');
        }

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        this.logDir = path.join(this.logDir, 'vrspace');
        this.logFilePath = path.join(this.logDir, this.logFileName);

        // If directory does not exist, create it
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    openFile(): fs.WriteStream {
        return fs.createWriteStream(this.logFilePath, {
            flags: 'a'
        });
    }

    closeFile(stream: fs.WriteStream): void {
        stream.close();
    }

    logLine(level: string, message: any): string {
        let dateNow: Date = new Date();
        let dateLOG: string = format(dateNow, 'dd/MM/yyyy H:mm:ss:SSS');
        let appName = this.logApp;
        if(appName === 'VRSPACE')
            appName = 'MAIN'
        return util.format('[%s] - [%s] - [%s] - %s', dateLOG, appName, level, typeof message === 'object' ? JSON.stringify(message) : message);
    }

    info(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('INFO', message));
    }

    success(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('SUCCESS', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('SUCCESS', message));
    }

    working(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('WORKING', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('WORKING', message));
    }

    debug(message: any): void {
        if (this.debugType) {
            let stream = this.openFile();
            stream.write(this.logLine('DEBUG', message));
            this.closeFile(stream);
            this.logToConsole(this.logLine('DEBUG', message));
        }
    }

    error(exception: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('ERROR', exception.message));
        this.closeFile(stream);
        stream = this.openFile();
        console.log('STACK TRACE: ' + exception.stack);
        stream.write(this.logLine('ERROR', exception.stack || exception));
        this.closeFile(stream);
        this.logToConsole(exception);
    }

    warn(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('WARN', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('WARN', message));
    }

    fatal(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('FATAL', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('FATAL', message));
    }

    log(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('INFO', message));
    }

    write(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
    }

    logToConsole(message: any): void {
        console.log(message);
    }

    returnLogDirectory(): string {
        return this.logDir;
    }
}