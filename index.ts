import { Elysia,  } from 'elysia';
import { routes } from './routes/main.routes.ts' //add this line
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static';

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
    .listen(3000)



export type App = typeof app;