# DARTWIC Checklists Plugin

The first-party interface-only Checklists resource for DARTWIC 2.0. It owns the checklist editor, token grammars, and five Markdown chips while using the interface host's React runtime and shared Markdown renderer.

Requires DARTWIC Engine and Interface 2.0.0 or newer. Core 2.0.0 packages will be published separately.

Installing the plugin exposes the stable `checklists` resource. Uninstalling it only hides the resource; existing files in the engine-managed `checklists/` directory remain untouched and reappear after reinstalling.

## Build

The matching `@dartwic/interface-sdk` 2.0.0 snapshot is bundled under `interface/sdk` and verified against `sdk-lock.json`. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run package` after cloning.

## GitHub release assets and layout

Release `2.0.4` uses tag `v2.0.4` and these exact uploaded assets:

```text
plugin.json
  plugin-win32-x64.zip
  plugin-linux-x64.zip
release-manifest.json         # generated SHA-256 checksums
```

Generic `plugin.zip` and separate `plugin-debug.zip` assets are not supported. The root `plugin.json` must also exist in the tagged source. Upload this same manifest directly to the release:

```json
{
  "id": "checklists",
  "name": "DARTWIC Checklists",
  "description": "First-party collaborative Markdown checklists and DARTWIC chips.",
  "author": "Kempton Burton",
  "version": "2.0.4",
  "minInterfaceVersion": "2.0.0",
  "contains_engine_plugin": false,
  "contains_interface_plugin": true,
  "minEngineVersion": "2.0.0"
}
```

Each ZIP has this exact layout:

```text
plugin/
  interface/checklists/plugin.json
  interface/checklists/ui/index.js
```

Run `npm ci`, `npm test`, `npm run typecheck`, then `npm run package`. The last command generates both platform-named ZIPs from the same Interface-only JavaScript output. There are no native binaries or separate Debug variant, and no C++ toolchain or vcpkg is required.

The plugin version, root manifest, and every manifest inside the ZIP must match. Publish a new version for changed assets. DARTWIC chooses native downloads by the Engine OS, independently of the Interface OS, and rejects missing platform packages. The full external-developer contract is in [Packaging and Installation](https://github.com/kemptonburton/dartwic-example-plugin#github-release-contract).
