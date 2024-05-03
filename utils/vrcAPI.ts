import * as vrchat from "vrchat";
import { LogManager } from './logger';
import { env } from "bun";
import axios from "axios";
import * as fs from "fs";
import { Cookie, CookieJar } from 'tough-cookie';
import { wrapper } from "axios-cookiejar-support";


let cookies: string; 
let isCookieFileReady:boolean = false;

const debugType = 'error';
const logger = new LogManager(debugType);


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

const API_KEY = "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26";
const USER_AGENT = "VRSpaceServer/0.0.1 - dev@vrspace.social";

const configuration = new vrchat.Configuration({
    username: env.VRC_USERNAME,
    password: env.VRC_PASSWORD,
    apiKey: API_KEY,
    baseOptions: {
        headers: {
            "User-Agent": USER_AGENT
        }
    }
});

const AuthenticationApi = new vrchat.AuthenticationApi(configuration);
const UsersApi = new vrchat.UsersApi(configuration);

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


function setAuthCookie(authCookie: string) {
    console.log("AUTH COOKIE IS: "+authCookie)
    const jar: any = (axios.defaults).jar;
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


console.log("[*] Initializing, login data:");
console.log(env.VRC_USERNAME);
console.log(env.VRC_PASSWORD);

const currentUserData = await authenticateUser();
logger.info(currentUserData);

