import { Elysia } from 'elysia';
import { routes } from './routes/main.routes.ts'
import { LogManager } from './utils/logger.ts';
import { cors } from '@elysiajs/cors';
import { rateLimit } from 'elysia-rate-limit';

// Logger Stuff
const PORT: number = 3000;
const debugType: string = 'error';
const vrsLogger: LogManager = new LogManager(debugType, 'VRSPACE-API');

vrsLogger.info("Starting VRSpace API Server...");

console.log("\r\n _    ______  _____                     \r\n| |  \/ \/ __ \\\/ ___\/____  ____ _________ \r\n| | \/ \/ \/_\/ \/\\__ \\\/ __ \\\/ __ `\/ ___\/ _ \\\r\n| |\/ \/ _, _\/___\/ \/ \/_\/ \/ \/_\/ \/ \/__\/  __\/\r\n|___\/_\/ |_|\/____\/ .___\/\\__,_\/\\___\/\\___\/ \r\n               \/_\/                      \r\n")

vrsLogger.info("Running on OS: " + process.platform + " " + process.arch);
if (typeof Bun !== 'undefined' && Bun.version) {
    vrsLogger.info("Ruuning on Bun version: " + Bun.version);
    vrsLogger.debug("Using Faster Runtime");
} else {
    vrsLogger.warn("Running on NodeJS version: " + process.version);
    vrsLogger.debug("Using Slower Runtime");
}


// Server Stuff
new Elysia()
    .onError(({ code }) => {
        if (code === 'NOT_FOUND')
            return 'Route not found :('
    })
    .use(routes)
    .use(cors({
        origin: ['http://localhost:5173', 'http://localhost:3000', 'https://tauri.localhost', '*'],
    }))
    .use(rateLimit({
        max: 30,
        duration: 10000,
        errorResponse: new Response("HEY YOU! Slowdown! I can handle just a few requests :(", {
            status: 429,
            headers: new Headers({
                'Content-Type': 'text/plain',
                'X-Are-You-A-Good-Boy': 'false',
                'X-Why-Are-You-Not-A-Good-Boy': 'You are spamming me! >:C'
            }),
        }),
    }))
    .onRequest(({ set, request }) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        vrsLogger.debug(request.method + " Request received on: " + request.url)
    })
    .get('/', () => {
        return '\nworks';
    })
    .listen(PORT)
vrsLogger.success("Server started on port " + PORT);