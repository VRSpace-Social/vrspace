import { doLogin, doLogout, getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends, getInstanceInfo, findUserAvatar } from '../utils/vrcAPI.ts';
import type {VRChatCookieFormat} from "../interfaces/apiHelper";

async function manualLoginLogout()
{
    console.log("[!] Manual login and logout test")
    const logoutData = await doLogout();
    console.log(logoutData);
    const loginData = await doLogin(true);
    console.log(loginData);
}

let debugRun = process.env.DEBUG_RUN || false;
if(debugRun)
    manualLoginLogout().then(async () => {
        console.log("Logged in and out\nTrying to get online friends");
        const friendData = await seeOnlineFriends();
        console.log(friendData);
    });
else
    console.log("[!] DEBUG_RUN is not set to true");
    function extractCookie(rawCookie: string): VRChatCookieFormat {
        console.log("raw cookie")
        console.log(rawCookie)
        let owo = new Date(Date.parse(rawCookie.split("Expires=")[1].split(";")[0]))
        let rawDate = Date.parse(rawCookie.split("Expires=")[1].split(";")[0]);
        let finalDate = new Date(rawDate);
        return {
            key: rawCookie.split("=")[0],
            value: rawCookie.split("=")[1].split(";")[0],
            maxAge: Number(rawCookie.split("Max-Age=")[1].split(";")[0]),
            path: rawCookie.split("Path=")[1].split(";")[0],
            expires: finalDate,
            httpOnly: rawCookie.includes("HttpOnly"),
            sameSite: rawCookie.split("SameSite=")[1].split(";")[0],
            hostOnly: true,
            creation: new Date()
        };

    }
    let cookie = "auth=authcookie_49ad8b6b-d114-44cc-aef2-aeb154c0e7a5; Max-Age=604800; Path=/; Expires=Wed, 05 Jun 2024 20:02:17 GMT; HttpOnly; SameSite=Lax";
    console.log(extractCookie(cookie));
    const res = await findUserAvatar('usr_ca92ff94-4841-4438-8546-7def70a94107')
    console.log(res);

    
    
