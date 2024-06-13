import { Elysia } from "elysia";
import { getOnlineFriends, searchUsers } from "../utils/apiHelper";
import {getAuthCookie, getUserInfo, getInstanceInfo} from "../utils/vrchatAPI.ts";

export const routes = new Elysia()
    .get("/hi", () => {
        return "hello!"
    })
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
    .get('/vrc-wss.js', ({set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        return Bun.file('./web/vrc-wss.js');
    })
    .get('/api/getAuthCookie', async ({set, headers}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        if(headers['user-agent'] !== 'VRSpaceApp') {
            set.status = 404
            return 'Not Found :('
        } else {
            return await getAuthCookie();
        }
        
    })
    .get('/api/getUserInfo', async ({query, set, headers}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        if(headers['user-agent'] !== 'VRSpaceApp') {
            set.status = 404
            return 'Not Found :('
        } else {
            if(query.userID) {
                return await getUserInfo(query.userID);
            }
        }
        
    })
    .get('/api/getInstanceInfo', async ({query, set}) => {
        set.headers['x-powered-by'] = 'A protogen somewhere in a server farm'
        console.table(query)
        if(query.instanceID && query.worldID) {
            const instanceInfo = await getInstanceInfo(query.worldID, query.instanceID);
            return instanceInfo;
        } else {
            console.log('No instanceID or worldID provided')
        }
    })
