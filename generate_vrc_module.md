# Installation

The new package.json file updates the following modules:
- `tough-cookie` -> from `4.0.0` to `4.1.4`
- `@types/tough-cookie` -> from `4.0.1` to `4.0.5`
- `axios` -> from `0.26.1` to `0.28.1`
  - Fixes this [CVE](https://security.snyk.io/vuln/SNYK-JS-AXIOS-6032459) present in `0.26.1` 


To install the "updated" `vrchatapi-javascript`, exec this bash script

```bash
chmod +x prepare-vrc.sh
./prepare-vrc.sh
```

Then, you can install all of VRSpace's deps with:
```bash
bun install
```


# Save and build modifications to the "vrchatapi-javascript" module

Go to vrchatapi-javascript folder and run the following command:
```bash
npm install
npm run prepare
```

Then, go back to the root folder and run the following command:
```bash
npm install vrchatapi-javascript/
```

It should work now.
