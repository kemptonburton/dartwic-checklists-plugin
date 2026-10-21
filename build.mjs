import {packagePluginRelease} from "./scripts/plugin-release.mjs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {cp, mkdir, readFile, rm} from "node:fs/promises";
import {build} from "esbuild";

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
    await packagePluginRelease(root, ["win32-x64", "linux-x64"]);
}
