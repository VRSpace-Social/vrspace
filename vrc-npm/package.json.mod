{
  "name": "vrchat",
  "version": "1.17.5",
  "description": "🟡🔵 VRChat API Library for JavaScript and TypeScript",
  "author": "OpenAPI-Generator Contributors",
  "repository": {
    "type": "git",
    "url": "https://github.com/vrchatapi/vrchatapi-javascript.git"
  },
  "keywords": [
    "axios",
    "typescript",
    "openapi-client",
    "openapi-generator",
    "vrchat"
  ],
  "license": "MIT",
  "main": "./dist/index.js",
  "typings": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc ",
    "prepare": "npm run build"
  },
  "dependencies": {
"tough-cookie": "^4.1.4",
"axios-cookiejar-support": "^1.0.1",
"@types/tough-cookie": "^4.0.5",
    "axios": "^0.28.1"
  },
  "devDependencies": {
    "@types/node": "^12.11.5",
    "typescript": "^4.0"
  }
}
