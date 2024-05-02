# Login

## Prerequisiti
-   User Agent
-   APIKEY
> JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26

### User Login :
-   Manda i dati di login
-   Server risponde con:
    -  totp/otp needed
    -   Inoltre manda a client IL COOKIE del AuthCookie (serve per login base e WS)
-   Client manda il OTP + AuthCookie (sempre come cookie):
-   Server risponde con OK:
    - Setta anche il twoFactorAuth (serve per il resto delle call API) come cookie
-   Per proseguire, servono entrambi gli 'AuthCookie' e 'twoFactorAuth' settati come cookie client 