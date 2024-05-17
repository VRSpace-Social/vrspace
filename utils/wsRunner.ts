import type { User } from "vrchat";
import { getAuthCookie, getUserInfo, loginAndSaveCookies, seeOnlineFriends, getInstanceInfo } from "./vrcAPI";
import WebSocket from "ws";
import { LogManager } from './logger';

// Logger Stuff
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType);

const USER_AGENT: string = "VRSpaceWSClient/0.0.1 - dev@vrspace.social";

let isWSRunning: boolean = false;
let wsStoppedCount: number = 0;
let lastError: string = "";

async function loginAndRun(): Promise<void> {
    return getAuthCookie().then(async (cookie) => {
        return runWS(cookie);
    }).catch(async () => {
        logger.warn("No authCookie found, creating cookie file and retrying to retrieve authCookie again for 10 times");
        let onlyWS = prompt("Do you want to only run the WS? (Y/N)");
        if(onlyWS === "Y" || onlyWS === "y") {
            await loginAndSaveCookies(true);
        } else {
            await loginAndSaveCookies();
        }
        return loginAndRun();
    });
}

async function runWS(cookies: string) {
    const socket: WebSocket = new WebSocket("wss://pipeline.vrchat.cloud/?authToken=" + cookies, {
        headers: {
            "User-Agent": USER_AGENT
        }
    });
    socket.addEventListener('open', () => {
        logger.success("Connected to VRChat Websocket");
        isWSRunning = true;
    });
    socket.addEventListener("message", async (event) => {
        if(JSON.parse(event.data.toString()).err) {
            logger.fatal("Sorry, but it seems like that you're trying to connect to the server with invalid tokens.");
            process.exit(1);
        }
        logger.info("Message from VRC WSS server! ");
        
        /*
           TODO:
           Types to still implement:
           - friend-update
           - friend-location

           Groups, Notifications, notification-v2, Users, content-refresh, instance-queue-joined, instance-queue-ready
           */

        switch (JSON.parse(event.data.toString()).type) {

            case "friend-active": {
                let jsonData: User = JSON.parse(JSON.parse(event.data.toString()).content).user;
                console.log("##########################");
                console.log("#                        #");
                console.log(jsonData.displayName + " is online on VRChat Website/API");
                console.log("#                        #");
                console.log("##########################");
                break;
            }

            case "friend-offline": {
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    console.log("[!!] ERROR on"+JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if(friendData === undefined) {
                    logger.warn("Friend is not found");
                    break;
                }
                let friendUsername: string = friendData.displayName;
                console.log("##########################");
                console.log("#                        #");
                console.log(friendUsername + " has gone offline");
                console.log("#                        #");
                console.log("##########################");
                break;
            }

            case "friend-delete": {
                logger.info(event.data.toString());
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    console.log("[!!] ERROR on"+JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if(friendData === undefined) {
                    logger.warn("Friend is not found");
                    break;
                }
                let friendUsername: string = friendData.displayName;
                console.log(friendUsername + " is no longer your friend");
                break;
            }

            case "friend-online": {
                let friendUsername: string = JSON.parse(JSON.parse(event.data.toString()).content).user.displayName;
                console.log("##########################");
                console.log("#                        #");
                console.log(friendUsername + " is online on VRChat Client");
                console.log("#                        #");
                console.log("##########################");
                break;
            }

            case "friend-location" : {
                let jsonData = JSON.parse(JSON.parse(event.data.toString()).content);
                if(jsonData.location === "traveling" && jsonData.travelingToLocation !== "" && jsonData.worldId.substring(0,5) === "wrld_") {
                    let worldId: string = jsonData.worldId;
                    let instanceId: string = jsonData.travelingToLocation.split(":")[1];;
                    let instanceData = await getInstanceInfo(worldId, instanceId).catch(e => {
                        logger.error("Error while trying to get instance data: " + e);
                        return undefined;
                    });
                    logger.log("User ("+jsonData.user.displayName+") is traveling to a ("+jsonData.type+") instance (" + instanceData?.location + ") in " + instanceData?.world.name);
                } else if(jsonData.location === "private" && jsonData.worldId === "private" && jsonData.travelingToLocation === "private") {
                    logger.log("User ("+jsonData.user.displayName+") is in a private instance (probably in a private world or in a private instance of a public world)");
                }
                break;
            }

            default: {
                try{
                    console.log("Unknown message type: " + JSON.parse(event.data.toString()).type);
                    logger.log(JSON.parse(JSON.parse(event.data.toString()).content));
                } catch(e) {
                    logger.error("Error while trying to parse message: " + e)
                    console.log(JSON.parse(event.data.toString()));
                    lastError = JSON.parse(event.data.toString()).err;
                    
                }
            }

        }
        console.log("#####################")
    });

    socket.addEventListener('close', () => {
        console.log('Server connection closed');
        logger.warn("Last logger error: \n" + lastError)
        isWSRunning = false;
        wsStoppedCount++;
    });
}

loginAndRun().catch(e => {
    logger.warn("Error while trying to connect to VRChat Websocket")
    logger.error(e);
    return;
}).then(() => logger.working("Running WS.."));


// if wsRunning is false, then we will try to login again
setInterval(() => {
    if(!isWSRunning) {
        if(wsStoppedCount < 10) {
            loginAndRun().catch(e => {
                logger.warn("Error while trying to connect to VRChat Websocket")
                logger.error(e);
                return;
            }).then(() => logger.working("Running WS.."));
        }
        else {
            logger.fatal("WS has crashed 10 times, exiting..")
            process.exit(1);
        }  
    }
}, 10000);

export { loginAndRun }