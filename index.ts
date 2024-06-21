import { Elysia } from 'elysia';
import { routes } from './routes/main.routes.ts'
import { LogManager } from './utils/logger.ts';
import { cors } from '@elysiajs/cors';
import { rateLimit } from 'elysia-rate-limit';
import {deleteCookieFile, doLogin, validateAuthCookie} from './utils/vrchatAPI.ts';

import readline from 'readline';

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle user input
const handleInput = (userInput: string) => {
switch (userInput) {
    case 'delete-cookie':
        deleteCookieFile();
        break;
    case 'validate':
        validateAuthCookie().then(() => {
            vrsLogger.working("Validating authCookie...");
        });
        break;
    case 'auth':
        rl.question('Enter your 2FA code: ', (twoFactorCode) => {
            doLogin(true, twoFactorCode).then(() => {
                vrsLogger.working("Trying to auth to VRChat...");
            });
        });
        break;
    case 'help':
        console.log('Commands:');
        console.log('  delete-cookie - Delete the cookie file');
        console.log('  validate - Validate if the current session is authenticated with VRChat');
        console.log('  auth - Force re-authentication with VRChat');
        console.log('  help - Show this help message');
        console.log('  stop - Stop the server');
        break;
    case 'clear':
        console.clear();
        break;
    case 'stop':
        rl.close();
        break;
    case 'exit':
        rl.close();
        break;
    default:
        console.log('Unrecognized command.');
        break;
}
};

// Function to prompt the user for input
const promptUser = () => {
  rl.question('VRS-$: ', (userInput) => {
    handleInput(userInput);
    promptUser(); // Prompt again after handling input
  });
};

// Logger Stuff
const PORT: number = 3000;
const debugType: string = 'error';
const vrsLogger: LogManager = new LogManager(debugType, 'VRSPACE-API');

vrsLogger.info("Starting VRSpace API Server...");

console.log("\r\n _    ______  _____                     \r\n| |  \/ \/ __ \\\/ ___\/____  ____ _________ \r\n| | \/ \/ \/_\/ \/\\__ \\\/ __ \\\/ __ `\/ ___\/ _ \\\r\n| |\/ \/ _, _\/___\/ \/ \/_\/ \/ \/_\/ \/ \/__\/  __\/\r\n|___\/_\/ |_|\/____\/ .___\/\\__,_\/\\___\/\\___\/ \r\n               \/_\/                      \r\n")

vrsLogger.info("Running on OS: " + process.platform + " " + process.arch);
vrsLogger.info("Bun version: "+ Bun.version);


// Start the initial prompt
promptUser();

 new Elysia()
    .onError(({ code }) => {
        if (code === 'NOT_FOUND')
            return 'Route not found :('
    })
    .use(routes)
    .use(cors({
        origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
    }))
    .use(rateLimit({
        max: 30,
        duration: 10000,
        errorResponse:  new Response("HEY YOU! Slowdown! I can handle just a few requests :(", {
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
        vrsLogger.debug(request.method + " Request received on: "+request.url)
    })
    .get('/', () => {
        return '\nworks';
    })
    .listen(PORT)
    vrsLogger.success("Server started on port " + PORT);