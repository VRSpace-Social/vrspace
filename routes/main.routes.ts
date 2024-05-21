import { Elysia } from "elysia";
import { getOnlineFriends } from "../utils/apiHelper";

export const routes = new Elysia()

    .get("/api/getOnlineFriends", ({set}) => {
        set.headers['x-powered-by'] = 'Elysia'
        let friendData = getOnlineFriends();
        return friendData;
    })
    .all('/lmao', () => 'hi')
    .get('/vrc', () => {
        let webPage = Bun.file('./web/index.html');
        return webPage;
    })