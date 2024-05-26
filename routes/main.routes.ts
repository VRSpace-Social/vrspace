import { Elysia } from "elysia";
import { getOnlineFriends, searchUsers } from "../utils/apiHelper";

export const routes = new Elysia()

    .get("/api/getOnlineFriends", ({set}) => {
        set.headers['x-powered-by'] = 'Elysia'
        let friendData = getOnlineFriends();
        return friendData;
    })
    .get("/api/searchFriends", ({set, query}) => {
        set.headers['x-powered-by'] = 'Elysia'
        if(query.query) {
            let users = searchUsers(query.query);
            return users;
        } else {
            return 'No query provided';
        }
        
    })
    .all('/lmao', () => 'hi')
    .get('/vrc', ({query}) => {
        let webPage = Bun.file('./web/index.html');
        if(query.query) {
            let users = searchUsers(query.query);
            return users;
        }
        return webPage;
    })