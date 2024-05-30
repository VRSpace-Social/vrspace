#!/bin/bash

# Remove if any
rm -r vrchatapi-javascript

git clone https://github.com/vrchatapi/vrchatapi-javascript.git
cd vrchatapi-javascript
npm install
./generate.sh
mv package.json package.json.orig
mv package-lock.json package-lock.json.orig
cp ../vrc-npm/package.json.mod package.json
cp ../vrc-npm/package-lock.json.mod package-lock.json
npm install
npm run prepare
cd ..
npm install vrchatapi-javascript/

echo "1st stage: VRChat NPM Module START"
cd vrchatapi-javascript
npm install
npm run prepare
echo "1st stage: VRChat NPM Module END"
cd ..
echo "2nd stage: VRChat NPM Module START"
npm install vrchatapi-javascript/
echo "2nd stage: VRChat NPM Module END"
