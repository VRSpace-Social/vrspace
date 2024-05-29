import type { User } from "vrchat";
import { getAuthCookie, getUserInfo, loginAndSaveCookies, getInstanceInfo } from "./vrcAPI";
import WebSocket from "ws";
import { LogManager } from './logger';
import { argv } from "bun";

// Logger Stuff
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType, 'VRCHAT-WSS');

const USER_AGENT: string = "VRSpaceWSClient/0.0.1 - dev@vrspace.social";

let isWSRunning: boolean = false;
let wsStoppedCount: number = 0;
let lastError: string = "";

async function loginAndRun(): Promise<void> {
    return getAuthCookie().then(async (cookie) => {
        return runWS(cookie);
    }).catch(async () => {
        logger.warn("No authCookie found, creating cookie file and retrying to retrieve authCookie again for 10 times");
        await loginAndSaveCookies();
        return loginAndRun();
    });
}

async function runWS(cookies: string) {
    const socket: WebSocket = new WebSocket("wss://pipeline.vrchat.cloud/?authToken=" + cookies, {
        headers: {
            "User-Agent": USER_AGENT
        }
    });
    logger.debug("wss://pipeline.vrchat.cloud/?authToken=" + cookies);
    socket.addEventListener('open', () => {
        logger.success("Connected to VRChat Websocket");
        isWSRunning = true;

    });
    socket.addEventListener("message", async (event) => {
        if (JSON.parse(event.data.toString()).err) {
            logger.fatal("Sorry, but it seems like that you're trying to connect to the server with invalid or missing tokens.");
            console.log(argv)
            if (argv[2] === "--reset") {
                logger.debug("Resetting cookies..");
                await loginAndSaveCookies();
            }
            else {
                process.exit(1);
            }

        }
        //logger.info("Message from VRC WSS server! ");

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
                logger.success(jsonData.displayName + " is now active (online on VRC Website or API)");
                break;
            }

            case "friend-offline": {
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    let errorResponse = JSON.parse(e.response?.data);
                    console.log(errorResponse);
                    console.log("[!!] ERROR on" + JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if (friendData === undefined) {
                    logger.warn("Friend is not found");
                    break;
                }
                let friendUsername: string = friendData.displayName;
                logger.success(friendUsername + " is pending offline");
                break;
            }

            case "friend-delete": {
                logger.info(event.data.toString());
                let friendData: User | undefined = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId).catch(e => {
                    console.log("[!!] ERROR on" + JSON.parse(event.data.toString()) + "\nError while trying to get friend data: \n" + e);
                    return undefined;
                });
                if (friendData === undefined) {
                    logger.warn("Friend is not found");
                    break;
                }
                let friendUsername: string = friendData.displayName;
                logger.success(friendUsername + " is no longer your friend");
                break;
            }

            case "friend-online": {
                let friendUsername: string = JSON.parse(JSON.parse(event.data.toString()).content).user.displayName;
                logger.success(friendUsername + " is online on VRChat Client");
                break;
            }

            case "friend-location": {
                let jsonData = JSON.parse(JSON.parse(event.data.toString()).content);
                let location = jsonData.location;
                let travelingToLocation = jsonData.travelingToLocation;

                if (location === "traveling" && travelingToLocation !== "" && jsonData.worldId.substring(0, 5) === "wrld_") {
                    // User IS TRAVELING to instance
                    let worldId: string = jsonData.worldId;
                    let instanceId: string = jsonData.travelingToLocation.split(":")[1];
                    let instanceData = await getInstanceInfo(worldId, instanceId).catch(e => {
                        logger.error("Error while trying to get instance data: " + e);
                        return undefined;
                    });
                    logger.log("User (" + jsonData.user.displayName + ") is traveling to world: [" + instanceData?.world.name + "]");

                } else if (location !== "" && travelingToLocation === "" && location.substring(0, 5) === "wrld_") {
                    // User HAS TRAVELED to instance
                    let worldId: string = jsonData.worldId;
                    let instanceId: string = location.split(":")[1];
                    let instanceData = await getInstanceInfo(worldId, instanceId).catch(e => {
                        logger.error("Error while trying to get instance data: " + e);
                        return undefined;
                    });
                    logger.log("User (" + jsonData.user.displayName + ") has traveled to world: [" + instanceData?.world.name + "]");
                }
                else if (location === "private" && jsonData.worldId === "private" && travelingToLocation === "private") {
                    logger.log("User (" + jsonData.user.displayName + ") is in a private instance (probably in a private world or in a private instance of a public world)");
                }
                else {
                    logger.debug("PLEASE CHECK, NEEDS TO BE IMPLEMENTED");
                    logger.log(jsonData);
                }
                break;
            }

            default: {
                try {
                    logger.write(JSON.parse(event.data.toString()));
                } catch (e) {
                    logger.error("Error while trying to parse message: " + e)
                    console.log(JSON.parse(event.data.toString()));
                    lastError = JSON.parse(event.data.toString()).err;

                }
            }

        }
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
    if (!isWSRunning) {
        if (wsStoppedCount < 10) {
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