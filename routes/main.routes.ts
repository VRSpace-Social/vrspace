import {Elysia} from "elysia";
import {getOnlineFriends, searchUsers} from "../utils/apiHelper";
import {getAuthCookie, getInstanceInfo, getUserInfo} from "../utils/vrchatAPI.ts";

export const routes = new Elysia()
    .get("/hi", () => {
        return "hello!"
    })
    .get("/api/getOnlineFriends", ({set}) => {
        return getOnlineFriends();
    })
    .get("/api/searchFriends", ({set, query}) => {
        if(query.query) {
            return searchUsers(query.query);
        } else {
            return 'No query provided';
        }
        
    })
    .get('/api/getAuthCookie', async ({set, headers}) => {
        if(headers['user-agent'] !== 'VRSpaceApp') {
            set.status = 404
            return 'Not Found :('
        } else {
            return await getAuthCookie();
        }
        
    })
    .get('/api/getUserInfo', async ({query, set, headers}) => {
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
        console.table(query)
        if(query.instanceID && query.worldID) {
            return await getInstanceInfo(query.worldID, query.instanceID);
        } else {
            console.log('No instanceID or worldID provided')
        }
    })
