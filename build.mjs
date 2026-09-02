import path from "node:path";
import {fileURLToPath} from "node:url";
import {cp, mkdir, readFile, rm} from "node:fs/promises";
import {build} from "esbuild";
import {spawn} from "node:child_process";

const root = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, "plugin.json"), "utf8"));
const outputRoot = path.join(root, "plugin", "interface", manifest.id);
await rm(path.join(root, "plugin"), {recursive: true, force: true});
await mkdir(path.join(outputRoot, "ui"), {recursive: true});
await build({
    entryPoints: [path.join(root, "interface", "src", "runtime-entry.jsx")],
    outfile: path.join(outputRoot, "ui", "index.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2022"],
    jsx: "transform",
    minify: true,
    legalComments: "none"
});
await cp(path.join(root, "plugin.json"), path.join(outputRoot, "plugin.json"));
console.log(`Built ${manifest.id} interface plugin at ${outputRoot}`);

if (process.argv.includes("--zip")) {
    const archivePath = path.join(root, "plugin.zip");
    await rm(archivePath, {force: true});
    const command = process.platform === "win32" ? "powershell.exe" : "zip";
    const args = process.platform === "win32"
        ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "Compress-Archive -LiteralPath 'plugin' -DestinationPath 'plugin.zip' -Force"]
        : ["-qr", "plugin.zip", "plugin"];
    await new Promise((resolve, reject) => {
        const child = spawn(command, args, {cwd: root, stdio: "inherit"});
        child.on("error", reject);
        child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Archive command exited with ${code}.`)));
    });
    console.log(`Packaged plugin archive at ${archivePath}`);
}
