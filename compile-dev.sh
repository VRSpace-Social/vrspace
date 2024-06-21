#!/bin/bash
# Remove old output
rm -rf ./out/linux
rm -rf ./out/win
rm -rf ./out/mac


# Linux x64
bun build --compile --target=bun-linux-x64 ./index.ts --outfile out/linux/api-linux-x64
# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-linux-x64-baseline ./index.ts --outfile out/linux/api-linux-x64-legacy-cpu


# Linux ARM64
bun build --compile --target=bun-linux-arm64 ./index.ts --outfile out/linux/api-linux-arm64


# Windows x64
bun build --compile --target=bun-windows-x64 ./index.ts --outfile out/win/api-windows-x64
# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-windows-x64-baseline ./index.ts --outfile out/win/api-windows-x64-legacy-cpu


# MacOS ARM64 (Silicon)
bun build --compile --target=bun-darwin-arm64 ./index.ts --outfile out/mac/api-darwin-arm64


# MacOS x64 (Intel)
bun build --compile --target=bun-darwin-x64 ./index.ts --outfile out/mac/api-darwin-x64