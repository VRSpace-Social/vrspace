import type { User } from "vrchat";
import { getAuthCookie, getUserInfo, loginAndSaveCookies } from "./vrcAPI";
import WebSocket from "ws";
import { LogManager } from './logger';

// Logger Stuff
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType);

const USER_AGENT: string = "VRSpaceWSClient/0.0.1 - dev@vrspace.social";

async function loginAndRun(): Promise<void> {
    return getAuthCookie().then(async (cookie) => {
        return runWS(cookie);
    }).catch(async () => {
        console.log("No authCookie found, creating cookie file and retrying to retrieve authCookie again for 10 times");
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
        console.log("Connected to VRChat Websocket");
    });
    socket.addEventListener("message", async (event) => {
        console.log("Message from VRC WSS server! ");

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
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId);
                if(friendData === undefined) {
                    console.log("Friend is not found");
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
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId);
                if(friendData === undefined) {
                    console.log("Friend is not found");
                    break;
                }
                let friendUsername: string = friendData.displayName;
                console.log(friendUsername + " is no longer your friend");
                break;
            }

            case "friend-online": {
                console.log(JSON.parse(event.data.toString()).content);
                let friendUsername: string = JSON.parse(JSON.parse(event.data.toString()).content).displayName;
                console.log("##########################");
                console.log("#                        #");
                console.log(friendUsername + " is online on VRChat Client");
                console.log("#                        #");
                console.log("##########################");
                break;
            }

            default: {
                try{
                    console.log("Unknown message type: " + JSON.parse(event.data.toString()).type);
                    logger.log(JSON.parse(JSON.parse(event.data.toString()).content));
                } catch(e) {
                    console.log("Error while trying to parse message: " + e)
                    console.log(JSON.parse(event.data.toString()));
                }
            }

        }
        console.log("#####################")
    });

    socket.addEventListener('close', () => {
        console.log('Server connection closed');
    });
}

loginAndRun().catch(e => {
    console.log("Error while trying to connect to VRChat Websocket");
    console.log(e);
    return;
}).then(() => console.log("Running WS.."));

export { loginAndRun }