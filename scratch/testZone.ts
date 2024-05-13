import { doLogin, doLogout, getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends } from '../utils/vrcAPI.ts';

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
// Here do whatever you want with the functions imported from vrcAPI.ts
