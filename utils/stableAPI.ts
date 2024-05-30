import * as vrchat from "vrchat";
import {LogManager} from './logger';
import {env} from "bun";
import * as fs from "fs";
import axios from "axios";
import { Cookie, CookieJar } from 'tough-cookie';
import type { AxiosResponse } from "axios";
import type { VRSpaceVRCUserAvatar } from "../interfaces/apiHelper";

// I don't fucking know what I'm doing, but it makes 'axios.default.jar' happy, and that's all it matters.
declare module 'axios' {
    interface AxiosRequestConfig {
        jar?: CookieJar;
    }
}

// Cookie Jar Stuff
let cookies: string;

// Logger Stuff
const debugType: string = 'error';
const logger: LogManager = new LogManager(debugType, 'VRCHAT-API');

if(await Bun.file('./.env').exists()) {
    if((env.VRC_USERNAME === "" || env.VRC_PASSWORD === "") ||
        (!env.VRC_USERNAME || !env.VRC_PASSWORD) ||
        (env.VRC_USERNAME === "your_vrchat_username" || env.VRC_PASSWORD === "your_vrchat_password")) {
        logger.warn("Please set your VRC_USERNAME and VRC_PASSWORD in your .env file")
        process.exit(1);
    }
}
else {
    logger.warn("Please create your .env file")
    process.exit(1);
}

logger.debug("Running Axios version: "+axios.VERSION)

// If the cookies file exists, load it
// Otherwise, throw an error
// In any case, set the axios defaults since we need that to attach to VRC axios instance to use the cookies
try
{
    cookies = fs.readFileSync("./cookies.json", "utf8");
    if (cookies !== "") {
        axios.defaults.jar = CookieJar.fromJSON(JSON.parse(cookies));
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

logger.info("Creating VRC Login vars and client");

// Default VRChat API Key, been known for a while
const VRC: string | undefined = env.VRC_APIKEY
// User Agent for the VRChat API, otherwise Cloudflare will block you
const USER_AGENT: string = "VRSpaceServer/0.0.1 - dev@vrspace.social";

// Configuration used for the wrapper
const configuration: vrchat.Configuration = new vrchat.Configuration({
    username: env.VRC_USERNAME,
    password: env.VRC_PASSWORD,
    apiKey: VRC,
    baseOptions: {
        headers: {
            "User-Agent": USER_AGENT
        }
    }
});

// API Methods
const AuthenticationApi: vrchat.AuthenticationApi = new vrchat.AuthenticationApi(configuration);
const FriendsApi: vrchat.FriendsApi = new vrchat.FriendsApi(configuration);
const UsersApi: vrchat.UsersApi = new vrchat.UsersApi(configuration);
const NotificationsApi: vrchat.NotificationsApi = new vrchat.NotificationsApi(configuration);
const InstancesApi: vrchat.InstancesApi = new vrchat.InstancesApi(configuration);

logger.success("VRC API is configured")

// Login function, this will get technical, so bear with me
/*
When you log in, you will get a response from the API, which will ask for the 2FA (TOTP/OTP),
and he API also sets up a "AuthCookie" in form of a [Set-Cookie] header, which is used for
continuing the login session; It's also the only Token you need for access the WebSocket.
After you receive the AuthCookie, you must a second request to the API with your 2FA code,
and if the code is correct, you will get a response with the TwoFactorAuth.

!!! IMPORTANT !!!
This cookie is very powerful as it can be used to log in to the VRChat API, so keep it safe.

This token is also set up by the [Set-Cookie] header, so you need to save it in a cookie jar.
For Auto-Login, you can save the cookie jar in a file, and load it in the Axios defaults for the API.
(See the function 'setAuthCookie')
*/
async function doLogin(forceLogin?: boolean): Promise<vrchat.CurrentUser>{
    return AuthenticationApi.getCurrentUser().then(async (resp) => {
        if (forceLogin || !resp.data.displayName) {
            if (forceLogin) deleteCookieFile();
            const verifyResp = await AuthenticationApi.verify2FA({
                code: prompt("[*] Please enter your two factor code: ")?.toString() ?? ""
            });
            if (verifyResp.data.verified) {
                logger.success("Verified Successfully, welcome to VRSpace!");
                setAuthCookie();
            }
        }
        const myself = await getMyself();
        logger.success("Welcome Back "+myself?.displayName+" to VRSpace!");
        return resp.data;
    }).catch((e) => {
        const errorResponse = e as any;
        if (errorResponse.response && errorResponse.response.status) {
            switch (errorResponse.response.status) {
                case 400:
                    throw new Error("Token is invalid");
                case 403:
                    throw new Error("Two factor authentication is required")
                default:
                    throw new Error("Unknown error, please see the following for more information:" + errorResponse.response.data);
            }
        }
        throw errorResponse;
    });
}

async function loginAndSaveCookies(): Promise<void> {
    await doLogin(true);
}

// Saves the AuthCookie and TwoFactorAuth from the CookieJar into a JSON file
function setAuthCookie(authCookie?: string): void {
    const jar: CookieJar | undefined = (axios.defaults)?.jar;
    if(!jar) {
        console.log("Cookie jar is undefined")
        return;
    }
    // We only add the AuthCookie and the API Key since the TwoFactorAuth is already in the cookie jar
    if(authCookie) {
        if (jar instanceof CookieJar) {
            jar.setCookie(
                new Cookie({key: 'auth', value: authCookie}),
                'https://api.vrchat.cloud'
            ).then(() => logger.write("authCookie written to Cookie JSON file"));
        }
    }
    if (jar instanceof CookieJar) {
        jar.setCookie(
            new Cookie({key: 'apiKey', value: 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26'}),
            'https://api.vrchat.cloud'
        ).then(() => logger.write("apiKey written to Cookie JSON file"));

    }
    if (jar instanceof CookieJar) {
        fs.writeFileSync("./cookies.json", JSON.stringify(jar.toJSON()));
    }
    logger.success("Cookies file saved")
}

/**
 * Deletes the cookie file.
 *
 * @returns {void}
 */
function deleteCookieFile(): void {
    try {
        fs.unlinkSync("./cookies.json");
        logger.success("Cookies file deleted")
    } catch (e) {
        console.error("Error: "+e)
    }
}


/**
 * Retrieves the list of online friends.
 *
 * @returns {Promise<vrchat.LimitedUser[] | undefined>} A promise that resolves to an array of online friends. If an error occurs, the promise will resolve to undefined.
 */
async function seeOnlineFriends(): Promise<vrchat.LimitedUser[]> {
    logger.write("Getting online friends")
    return FriendsApi.getFriends().then((resp) => {
        return resp.data;
    }).catch(async (e) => {
        if(axios.isAxiosError(e)) {
            if(e.response?.status === 401) {
                console.log("[✘] Token maybe invalid");
                await doLogin(true);
            }
        }
        throw e;
    });
}


/**
 * Retrieves user information from the VRChat API.
 *
 * @param {string} userId - The ID of the user to retrieve information for.
 * @returns {Promise<vrchat.User | undefined>} - A Promise that resolves with the user information if found, otherwise undefined.
 */
async function getUserInfo(userId: string): Promise<vrchat.User | undefined>{
    logger.working("Getting user info for: "+userId)
    return UsersApi.getUser(userId).then((resp) => {
        return resp.data;
    })
}

/**
 * Searches for users by the given username.
 *
 * @param {string} username - The username to search for.
 * @return {Promise<vrchat.LimitedUser[] | undefined>} - A promise that resolves with an array of LimitedUser objects if the search is successful, or undefined if the search fails.
 */
async function searchUser(username: string): Promise<vrchat.LimitedUser[]>{
    logger.write("Searching for user: "+username)
    return UsersApi.searchUsers(username).then((resp) => {
        return resp.data;
    });
}


/**
 * Retrieves notifications from the server.
 *
 * @returns {Promise<vrchat.Notification[] | [] | undefined>} A promise that resolves to an array of notifications, or an empty array, or undefined if an error occurs.
 */
async function getNotifications(): Promise<vrchat.Notification[] | []> {
    return NotificationsApi.getNotifications().then((resp) => {
        return resp.data;
    })
}

/**
 * Perform logout operation
 *
 * @param {boolean} deleteCookies - Optional parameter to delete cookies
 * @return {Promise<void>} A promise that resolves when the logout operation is complete
 *
 * @throws {Error} If an error occurs during the logout operation
 */
async function doLogout(deleteCookies?: boolean): Promise<void> {
    return AuthenticationApi.logout().then((resp) => {
        logger.info(resp.data);
        if(deleteCookies)
            deleteCookieFile();
    })
}


/**
 * Get the authentication cookie value from the "cookies" global variable.
 * The value is parsed from JSON format.
 *
 * @returns {string} The authentication cookie value.
 * @throws {Error} If there is an error while parsing the cookie value.
 */
async function getAuthCookie(): Promise<string> {
    let cookieFile = Bun.file('./cookies.json');
    return cookieFile.exists().then(async (exists) => {
        if (exists) {
            return cookieFile.json().then((data) => {
                return data.cookies.find((cookie: any) => cookie.key === "auth").value;
            });
        } else {
            throw new Error("No auth cookie found, please login first");
        }
    })/*.catch((e) => {
        logger.fatal("There was an error while reading the cookie file: ");
        logger.error(e);
    })*/;
}


async function getInstanceInfo(worldId: string, instanceId: string): Promise<vrchat.Instance> {
    logger.write("Getting instance data for: "+worldId+" - "+instanceId)
    return InstancesApi.getInstance(worldId, instanceId).then((resp) => {
        return resp.data;
    }).catch((e) => {
        throw new Error(`Error while trying to get instance data: ${e.response}`);
    })
}

async function findUserAvatar (userId: string, getOnlyAvatarName?: boolean): Promise<AxiosResponse | VRSpaceVRCUserAvatar> {
    logger.write("Getting avatar data for: "+userId)
    return getUserInfo(userId).then(async (userData) => {
        const avatarPictureUrl = userData?.currentAvatarImageUrl;
        let avatarFileUrl = ""
        for(let i = 1; i <= 6 ; i++) {
            if(avatarPictureUrl?.split("/")[i] !== "")
                avatarFileUrl += avatarPictureUrl?.split("/")[i] + "/";
        }
        avatarFileUrl = "https://"+avatarFileUrl;
        return axios.get(avatarFileUrl, {
            headers: {
                'User-Agent': USER_AGENT
            },
        }).then(async (res) => {
            if (!getOnlyAvatarName) {
                return res?.data;
            } else {
                let avatarName = res?.data.name;
                avatarName = avatarName.split("Avatar - ")[1].split(" - Image - ")[0];
                return {
                    fileId: res?.data.id,
                    ownerId: res?.data.ownerId,
                    avatarName: avatarName,
                    avatarImageUrl: avatarFileUrl,
                    vrcData: res?.data
                };
            }
        });
    })
}


async function getMyself(): Promise<vrchat.CurrentUser> {
    logger.write("Getting current user info")
    return AuthenticationApi.getCurrentUser().then((resp) => {
        return resp.data;
    })
}

export
{
    getAuthCookie,
    getUserInfo,
    searchUser,
    getNotifications,
    seeOnlineFriends,
    doLogout,
    doLogin,
    loginAndSaveCookies,
    getInstanceInfo,
    findUserAvatar,
    getMyself
}