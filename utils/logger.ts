import {join} from 'path';
import * as fs from 'fs';
import * as util from 'util';
import { format } from 'date-fns';

let dateNow: Date = new Date();
let dateStamp: string = format(dateNow, "yyyy-MM-dd H-mm-ss");

/**
 * The LogManager class provides logging functionality for the application.
 */
export class LogManager {
    logger: any;
    debugType: string;
    logDir: string;
    logFilePath: string;
    logFileName: string;
    logApp: string

    /**
     * Constructs a new instance of the LogManager class.
     * @param debugType - The debug type for logging.
     * @param logApp - The log application name.
     */
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

    /**
     * Checks if the log directory exists and creates it if it doesn't.
     */
    checkLogDirectory(): void {
        const currentDirectory = process.cwd();

        if(this.debugType) {
            // If debug mode is enabled, set logDir to current directory
            this.logDir = join(currentDirectory, 'logs');
        } else {
            this.logDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/tmp') || (process.platform === 'linux' ? process.env.HOME + '/.local/share' : '/tmp/');
        }

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        this.logDir = join(this.logDir, 'vrspace');
        this.logFilePath = join(this.logDir, this.logFileName);

        // If directory does not exist, create it
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    /**
     * Opens the log file in append mode and returns the write stream.
     * @returns The write stream for the log file.
     */
    openFile(): fs.WriteStream {
        return fs.createWriteStream(this.logFilePath, {
            flags: 'a'
        });
    }

    /**
     * Closes the log file stream.
     * @param stream - The write stream to close.
     */
    closeFile(stream: fs.WriteStream): void {
        stream.close();
    }

    /**
     * Formats the log line with the specified level and message.
     * @param level - The log level.
     * @param message - The log message.
     * @returns The formatted log line.
     */
    logLine(level: string, message: any): string {
        let dateNow: Date = new Date();
        let dateLOG: string = format(dateNow, 'dd/MM/yyyy H:mm:ss:SSS');
        let appName = this.logApp;
        if(appName === 'VRSPACE')
            appName = 'MAIN'
        return util.format('[%s] - [%s] - [%s] - %s', dateLOG, appName, level, typeof message === 'object' ? JSON.stringify(message) : message);
    }

    /**
     * Logs an info message.
     * @param message - The info message to log.
     */
    info(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('INFO', message));
    }

    /**
     * Logs a success message.
     * @param message - The success message to log.
     */
    success(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('SUCCESS', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('SUCCESS', message));
    }

    /**
     * Logs a working message.
     * @param message - The working message to log.
     */
    working(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('WORKING', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('WORKING', message));
    }

    /**
     * Logs a debug message if debug mode is enabled.
     * @param message - The debug message to log.
     */
    debug(message: any): void {
        if (this.debugType) {
            let stream = this.openFile();
            stream.write(this.logLine('DEBUG', message));
            this.closeFile(stream);
            this.logToConsole(this.logLine('DEBUG', message));
        }
    }

    /**
     * Logs an error message and stack trace.
     * @param exception - The error exception to log.
     */
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

    /**
     * Logs a warning message.
     * @param message - The warning message to log.
     */
    warn(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('WARN', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('WARN', message));
    }

    /**
     * Logs a fatal error message.
     * @param message - The fatal error message to log.
     */
    fatal(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('FATAL', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('⚠️ FATAL ⚠️', message));
    }

    /**
     * Logs a message.
     * @param message - The message to log.
     */
    log(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
        this.logToConsole(this.logLine('INFO', message));
    }

    /**
     * Writes a message to the log file without logging to the console.
     * @param message - The message to write.
     */
    write(message: any): void {
        let stream = this.openFile();
        stream.write(this.logLine('INFO', message));
        this.closeFile(stream);
    }

    /**
     * Logs a message to the console.
     * @param message - The message to log to the console.
     */
    logToConsole(message: any): void {
        console.log(message);
    }

    /**
     * Returns the log directory path.
     * @returns The log directory path.
     */
    returnLogDirectory(): string {
        return this.logDir;
    }
}