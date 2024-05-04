## How to get started

Setup your VRChat credentials on the file `.env.example`

by changing the default placeholder values with your own, then rename the file from `.env.example` to `.env`.


## Little explanation of how the VRChat login works

At first can be a little bit weird, and for this, I've created a Chart showing how the login works between the Client (our app) and the VRC API:

```mermaid
sequenceDiagram
    participant client
    participant api
    client->>api: sends creds w/ apikey
    api->>client: responses with "totp/otp needed" + authcookie
    client->>client: saves authcookie 
    client->>api: sends otp/totp code
    api->>client: responses with "twoFactorAuth" cookie
    client->>client: setup cookiejar
    client->>api: any request + cookiejar
    api->>client: 
    
```

The thing to remember is that the VRChat "SDK" uses Axios under the hood, so we must use the default Axios instance that maps to the VRChat SDK one.

So any modification to the cookiejar in Axios, will affect the cookiejar in the VRChat SDK's Axios instance.

For more information about the cookiejar and cookies in general and their use here, consult the comments on `vrcAPI.ts`.


## Running test code
If you want to experiment with some code you added to `vrcAPI.ts`, please add your testing code to this file:
> test/testZone.ts

To ensure that the main `vrcAPI.ts` its kept clean.



