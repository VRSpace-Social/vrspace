import { Elysia } from "elysia";
import { getOnlineFriends, searchUsers } from "../utils/apiHelper";
import {getAuthCookie, getUserInfo} from "../utils/vrcAPI.ts";

export const routes = new Elysia()

    .get("/api/getOnlineFriends", ({set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        let friendData = getOnlineFriends();
        return friendData;
    })
    .get("/api/searchFriends", ({set, query}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        if(query.query) {
            return searchUsers(query.query);
        } else {
            return 'No query provided';
        }
        
    })
    .all('/lmao', () => 'hi')
    .get('/vrc', ({query, set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        let webPage = Bun.file('./web/index.html');
        if(query.query) {
            return searchUsers(query.query);
        }
        return webPage;
    })
    .get('/vrc-wss.js', ({set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        return Bun.file('./web/vrc-wss.js');
    })
    .get('/api/getAuthCookie', async ({set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        return await getAuthCookie();
    })
    .get('/api/getUserInfo', async ({query, set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        if(query.userID) {
            return await getUserInfo(query.userID);
        }
    })
