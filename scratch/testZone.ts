import { doLogin, doLogout, getAuthCookie, getNotifications,
    getUserInfo, searchUser, seeOnlineFriends, getInstanceInfo, findUserAvatar } from '../utils/vrchatAPI.ts';
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
    const res = await getInstanceInfo('wrld_900dd077-1337-c0fe-babe-71de05ea12c4', "29051~hidden(usr_96462a96-0018-4f9b-b7b3-8b54c4d7af34)")
    console.log(res);

    
    
