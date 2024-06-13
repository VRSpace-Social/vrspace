import { Elysia,  } from 'elysia';
import { routes } from './routes/main.routes.ts' //add this line
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';
import { LogManager } from './utils/logger.ts';
import { cors } from '@elysiajs/cors'
import { logger } from "@bogeychan/elysia-logger";


// Logger Stuff
const PORT: number = 3000;
const debugType: string = 'error';
const vrsLogger: LogManager = new LogManager(debugType, 'VRSPACE-API');

vrsLogger.info("Starting VRSpace API Server...");

const app = new Elysia()
/*
    .use(
        logger({
        level: "error",
        })
    )
*/
    .onError(({ code }) => {
        if (code === 'NOT_FOUND')
            return 'Route not found :('
    })
    .use(routes) //add this line
    .use(staticPlugin({
        assets : "./web"
      }))
      .use(cors({
        origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
    }))
    .use(html())
    .listen(PORT)
    vrsLogger.success("Server started on port " + PORT);



export type App = typeof app;