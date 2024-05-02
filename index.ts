import * as vrchat from "vrchat";
import { Elysia } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { staticPlugin } from '@elysiajs/static';
import { html } from "@elysiajs/html";

import { env } from "bun";

import fs from "fs";
import path from "path";

const PORT = 3000;
const API_KEY = "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26";
const USER_AGENT = "VRSpaceServer/0.0.1 - dev@vrspace.social";

const configuration = new vrchat.Configuration({
    username: env.USERNAME,
    password: env.PASSWORD,
    apiKey: API_KEY,
    baseOptions: {
        headers: {
            "User-Agent": USER_AGENT
        }
    }
});

// const AuthenticationApi = new vrchat.AuthenticationApi(configuration);

async function getCurrentUser(): Promise<any> {
    try {
        const resp = await AuthenticationApi.getCurrentUser();
        const currentUser = resp.data;
        if (!currentUser.displayName) {
            const twoFactorCode: string | null = prompt("[*] Please enter your two factor code: ")?.toString() ?? "";
            console.log(`[DEBUG] Two factor code: ${twoFactorCode}`);

            const verifyResp = await AuthenticationApi.verify2FA({ code: twoFactorCode });
            if (verifyResp.data.verified) {
                console.log("[✔︎] Verified Successfully, welcome to VRSpace!");
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
    const currentUserData = await getCurrentUser();
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

console.log("[*] Initializing, login data:");
console.log(env.USERNAME);
console.log(env.PASSWORD);

// const currentUserData = await authenticateUser();

new Elysia()
    .use(cookie())
    .use(staticPlugin())
    .use(html())
    .get('/', () => {

    })
    .listen(PORT);

console.log("[*] Listening on http://localhost:" + PORT);
