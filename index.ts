import { Elysia } from 'elysia';
import { routes } from './routes/main.routes.ts' //add this line

const app = new Elysia()
    .onError(({ code }) => {
        if (code === 'NOT_FOUND')
            return 'Route not found :('
    })
    .use(routes) //add this line
    .listen(3000)


export type App = typeof app;