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
    
    socket.addEventListener('open', (event) => {
        console.log("Connected to VRChat Websocket");
    });
    
    socket.addEventListener("message", async (event) => {
        console.log("Message from VRC WSS server! ");

        switch (JSON.parse(event.data.toString()).type) {
            
            case "friend-active": {
                let jsonData = JSON.parse(JSON.parse(event.data.toString()).content);
                console.log(jsonData.user.displayName + " is active on VRChat's Website");
                break;
            }

            case "friend-offline": {
                let friendUsername: any = await getUserInfo(JSON.parse(JSON.parse(event.data.toString()).content).userId);
                console.log(friendUsername);
                friendUsername = friendUsername.data.displayName;
                console.log(friendUsername + " is offline");
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
    
    socket.addEventListener('close', (event) => {
        console.log('Server connection closed:\n', event);
    });
}

doRunWS(authCookie);

export { doRunWS }