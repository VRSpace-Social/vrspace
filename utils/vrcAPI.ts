import * as vrchat from "vrchat";
import { LogManager } from './logger';
import { env } from "bun";
import axios from "axios";
import * as fs from "fs";
import { Cookie, CookieJar } from 'tough-cookie';
import { wrapper } from "axios-cookiejar-support"; // DO NOT REMOVE THIS LINE

// Cookie Jar Stuff
let cookies: string; 
let isCookieFileReady: boolean = false;

// Logger Stuff
const debugType: string = 'error';
const logger = new LogManager(debugType);


// If the cookies file exists, load it
// Otherwise, throw an error
// In any case, set the axios defaults since we need that to attach to VRC axios instance to use the cookies
try
{
    cookies = fs.readFileSync("./cookies.json", "utf-8");
    if (cookies !== "") {
        axios.defaults.jar = CookieJar.fromJSON(JSON.parse(cookies));
        isCookieFileReady = true;
    }
}
catch (e)
{
    console.log("Error: "+e)
    console.warn("Cookie file not found, you need to login first")
}
finally
{
    axios.defaults.withCredentials = true;
}

// Default VRChat API Key, been known for a while
const API_KEY: string = "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26";
// User Agent for the VRChat API, otherwise Cloudflare will block you
const USER_AGENT: string = "VRSpaceServer/0.0.1 - dev@vrspace.social";

// Configuration used for the wrapper
const configuration: vrchat.Configuration = new vrchat.Configuration({
    username: env.VRC_USERNAME,
    password: env.VRC_PASSWORD,
    apiKey: API_KEY,
    baseOptions: {
        headers: {
            "User-Agent": USER_AGENT
        }
    }
});

// API Methods 
const AuthenticationApi = new vrchat.AuthenticationApi(configuration);
const FriendsApi = new vrchat.FriendsApi(configuration); 
const UsersApi = new vrchat.UsersApi(configuration);
const NotificationsApi = new vrchat.NotificationsApi(configuration);

// Login function, this will get technical, so bear with me
/*
When you login, you will get a response from the API, which will ask for the 2FA (TOTP/OTP)),
and he API also sets up a "AuthCookie" in form of a [Set-Cookie] header, which is used for
continuing the login session; Its also the only Token you need for access the WebSocket.
After you receive the AuthCookie, you must a second request to the API with your 2FA code,
and if the code is correct, you will get a response with the TwoFactorAuth.

!!! IMPORTANT !!!
This cookie is very powerful as it can be used to login to the VRChat API, so keep it safe.

This token is also set up by the [Set-Cookie] header, so you need to save it in a cookie jar.
For Auto-Login, you can save the cookie jar in a file, and load it in the Axios defaults for the API.
(See the function 'setAuthCookie')
*/
async function doLogin(): Promise<any> {
    try {
        const resp = await AuthenticationApi.getCurrentUser();
        const currentUser = resp.data;
        if (!currentUser.displayName) {
            const twoFactorCode: string | null = prompt("[*] Please enter your two factor code: ")?.toString() ?? "";
            logger.debug(`Two factor code: ${twoFactorCode}`);

            const verifyResp = await AuthenticationApi.verify2FA({ code: twoFactorCode });
            if (verifyResp.data.verified) {
                logger.success("Verified Successfully, welcome to VRSpace!");
            }
        }
        return resp.data;
    } catch (e) {
        const errorResponse = e as any;
        if (errorResponse.response && errorResponse.response.status) {
            switch (errorResponse.response.status) {
                case 400:
                    console.log("[✘] Token is invalid");
                    break;
                case 403:
                    console.log("[✘] Two factor authentication is required");
                    break;
                default:
                    console.log("[✘] Unknown error, please see the following for more information:");
                    console.log(errorResponse);
                    break;
            }
        } else {
            console.log("Unknown error");
        }
    }
}

// This function is needed when retrieving the AuthCookie from the API
async function authenticateUser(): Promise<any> {
    const currentUserData = await doLogin();
    if (!currentUserData) {
        return null;
    }
    try {
        const auth = await AuthenticationApi.verifyAuthToken(currentUserData.authToken);
        if (!auth.data.token) {
            console.error("[✘] Authentication token is invalid");
            return null;
        }
        console.log("[✔︎] Authentication token: ", auth.data.token);
        // Saving all cookies loaded from the local Axios cookiejar into a JSON file for later use.
        setAuthCookie(auth.data.token);
        return auth.data;
    } catch (e) {
        const errorResponse = e as any;
        if (errorResponse.response && errorResponse.response.status) {
            switch (errorResponse.response.status) {
                case 400:
                    console.log("[✘] Token is invalid");
                    break;
                case 403:
                    console.log("[✘] Two factor authentication is required");
                    break;
                default:
                    console.log("[✘] Unknown error, please see the following for more information:");
                    console.log(errorResponse);
                    break;
            }
        } else {
            console.log("[✘] Unknown error", errorResponse);
        }
        return null;
    }
}

// Saves the AuthCookie and TwoFactorAuth from the CookieJar into a JSON file
function setAuthCookie(authCookie: string) {
    const jar: CookieJar | undefined = (axios.defaults)?.jar;
    if(!jar) {
        console.log("Cookie jar is undefined")
        return;
    }
    // We only add the AuthCookie and the API Key since the TwoFactorAuth is already in the cookie jar
    jar.setCookie(
        new Cookie({ key: 'auth', value: authCookie }),
        'https://api.vrchat.cloud'
    )
    jar.setCookie(
        new Cookie({ key: 'apiKey', value: 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26' }),
        'https://api.vrchat.cloud'
    )
    fs.writeFileSync("./cookies.json", JSON.stringify(jar.toJSON()));
}


async function seeOnlineFriends(): Promise<vrchat.LimitedUser[] | undefined>{
    try {
        const resp = await FriendsApi.getFriends();
        return resp.data;
    } catch (e) {
        console.error(e);
    }
}


async function getUserInfo(userId: string): Promise<vrchat.User | undefined>{
    try {
        const resp = await UsersApi.getUser(userId)
        return resp.data;
    } catch (e) {
        console.error(e);
    }
}

async function searchUser(username: string, n: string = "50"): Promise<vrchat.LimitedUser[] | undefined>{
    try {
        const resp = await UsersApi.searchUsers(username);
        if(resp)
            return resp.data;
    } catch (e) {
        console.error(e);
    }
}

async function getNotifications(): Promise<vrchat.Notification[] | [] | undefined> {
    try {
        const resp = await NotificationsApi.getNotifications();
        if(resp.data)
            {
                return resp.data;
            }
    }
    catch (e) {
        console.error(e);
    }
}


function getAuthCookie() {
    try
    {
        return JSON.parse(cookies).cookies[0].value;
    }
    catch (e) {
        console.error("Error: "+e)
    }
    
}

console.log("[*] Initializing, login data:");

/*
const currentUserData = await authenticateUser();
const friendData = await seeOnlineFriends();
console.log(friendData);
const userData = await getUserInfo("usr_37a5ed4f-ea32-4d7a-9051-cb4883f5e8b0"); //IFritDemonGoat
console.log(userData)
*/


export 
{
    getAuthCookie,
    getUserInfo,
    searchUser,
    getNotifications
}