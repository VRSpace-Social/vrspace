# Remove old output
Remove-Item out/linux -Recurse -Force
Remove-Item out/win -Recurse -Force
Remove-Item out/mac -Recurse -Force

# Linux x64
bun build --compile --target=bun-linux-x64 ./index.ts --outfile out/linux/api-linux-x64 --minify-whitespace --minify-identifiers --minify-syntax --sourcemap
# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-linux-x64-baseline ./index.ts --outfile out/linux/api-linux-x64-legacy-cpu --minify-whitespace --minify-identifiers --minify-syntax --sourcemap


# Linux ARM64
bun build --compile --target=bun-linux-arm64 ./index.ts --outfile out/linux/api-linux-arm64 --minify-whitespace --minify-identifiers --minify-syntax --sourcemap


# Windows x64
bun build --compile --target=bun-windows-x64 ./index.ts --outfile out/win/api-windows-x64 --minify-whitespace --minify-identifiers --minify-syntax --sourcemap
# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-windows-x64-baseline ./index.ts --outfile out/win/api-windows-x64-legacy-cpu --minify-whitespace --minify-identifiers --minify-syntax --sourcemap


# MacOS ARM64 (Silicon)
bun build --compile --target=bun-darwin-arm64 ./index.ts --outfile out/mac/api-darwin-arm64 --minify-whitespace --minify-identifiers --minify-syntax --sourcemap


# MacOS x64 (Intel)
bun build --compile --target=bun-darwin-x64 ./index.ts --outfile out/mac/api-darwin-x64 --minify-whitespace --minify-identifiers --minify-syntax --sourcemap