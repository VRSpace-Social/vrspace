import type { User } from "vrchat";
import { getAuthCookie, getUserInfo } from "./vrcAPI";
import WebSocket from "ws";

const USER_AGENT: string = "VRSpaceWSClient/0.0.1 - dev@vrspace.social";
const authCookie: string = getAuthCookie();

async function doRunWS(authCookie: string): Promise<void> 
{
    console.log("Trying to connect with auth cookie: " + authCookie);

    const socket: WebSocket = new WebSocket("wss://pipeline.vrchat.cloud/?authToken=" + authCookie, {
        headers: {
            "User-Agent": USER_AGENT
    }});
    
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
                console.log(jsonData.displayName + " is online on VRchat Website/API");
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
                let friendUsername: string = JSON.parse(JSON.parse(event.data.toString()).content).displayName;
                console.log("##########################");
                console.log("#                        #");
                console.log(friendUsername + " is online on VRChat Client");
                console.log("#                        #");
                console.log("##########################");
                break;
            }

            default: {
                console.log("Unknown message type: " + JSON.parse(event.data.toString()).type);
                console.log(JSON.parse(JSON.parse(event.data.toString()).content));
                break;
            }

        }
        console.log("#####################")
    });
    
    socket.addEventListener('close', () => {
        console.log('Server connection closed');
    });
}

doRunWS(authCookie);

export { doRunWS }