```typescript
//This is a simple file to show how to use the VRC API to get a list of friends.

// First, I'll show the simple way to get a list of friends, by using our already implemented function `seeOnlineFriends`.
import { seeOnlineFriends } from "../utils/vrchatAPI.ts";

// Remember that you always need an async for use the already implemented functions.
async function main() {
const friendData = await seeOnlineFriends();
console.log(friendData);
}

main();

// ##############################################################################################

// Now, I'll show you a crude manual way to get a list of friends by doing the login phase.
// This is not recommended, as it's a lot more complex and error-prone.

import * as vrchat from "vrchat";
import { env } from "bun";

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
const AuthenticationApi = new vrchat.AuthenticationApi(configuration);
const FriendsApi = new vrchat.FriendsApi(configuration);

try {
// First, we need to login
const resp = await AuthenticationApi.getCurrentUser();
// The response will certianly be like this:
/*
requiresTwoFactorAuth: [ "totp", "otp" ]
*/
// This means that we need to verify our login with a two factor code.
const currentUser = resp.data;
if (!currentUser.displayName) {
const twoFactorCode: string | null = prompt("[*] Please enter your two factor code: ")?.toString() ?? "";
const verifyResp = await AuthenticationApi.verify2FA({ code: twoFactorCode });
if (verifyResp.data.verified) {
console.log("Bingo! Logged in successfully");
}
}
// We continue since we are logged in
const friends = await FriendsApi.getFriends();
// Here we go
console.log(friends.data);

} catch (e) {
console.log("Error: " + e)
}
```