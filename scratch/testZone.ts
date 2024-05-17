import { doLogin, doLogout, getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends, getInstanceInfo } from '../utils/vrcAPI.ts';

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
    let instanceId = "wrld_4cad78d6-0747-44ac-953f-43191fb53f28:47921".split(":")[1];
    const instanceData = await getInstanceInfo("wrld_4cad78d6-0747-44ac-953f-43191fb53f28", instanceId).catch(e => {
        console.log(e);
        console.log(e.response)
    });
    console.log(instanceData);
// Here do whatever you want with the functions imported from vrcAPI.ts
