import { doLogin, doLogout, getAuthCookie, getNotifications, getUserInfo, searchUser, seeOnlineFriends, getInstanceInfo, findUserAvatar } from '../utils/vrcAPI.ts';

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
    const res = await findUserAvatar('usr_ca92ff94-4841-4438-8546-7def70a94107')
    console.log(res);
    
    
