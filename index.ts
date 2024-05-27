import { Elysia,  } from 'elysia';
import { routes } from './routes/main.routes.ts' //add this line
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { LogManager } from './utils/logger.ts';

// Logger Stuff
const PORT: number = 3000;
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType, 'VRSPACE-API');

logger.info("Starting VRSpace API Server...");

const app = new Elysia()
    .onError(({ code }) => {
        if (code === 'NOT_FOUND')
            return 'Route not found :('
    })
    .use(routes) //add this line
    .use(staticPlugin({
        assets : "./web"
      }))
    .use(html())
    .listen(PORT)
    logger.success("Server started on port " + PORT);



export type App = typeof app;