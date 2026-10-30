# DARTWIC Checklists Plugin

The first-party interface-only Checklists resource for DARTWIC. It owns the checklist editor, token grammars, and five Markdown chips while using the interface host's React runtime and shared Markdown renderer.

Requires DARTWIC Engine and Interface 2.0.0 or newer. Version 2.1.0 refreshes the bundled Interface SDK for the DARTWIC 2.1 bundle. Checklists has no native Engine library; Engine plugin ABI 6 does not apply to it. Interface host compatibility remains 1.

Installing the plugin exposes the stable `checklists` resource. Uninstalling it only hides the resource; existing files in the engine-managed `checklists/` directory remain untouched and reappear after reinstalling.

Selecting an editable Markdown chip keeps its controls in the context board while the panel updates or resizes. Opening another checklist restores the default chip prompt.

## Build

The matching `@dartwic/interface-sdk` 2.0.0 snapshot is bundled under `interface/sdk` and verified against `sdk-lock.json`. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run package` after cloning.

## GitHub release assets and layout

Version `2.1.0` uses this package layout:

```text
plugin.json
plugin.zip
release-manifest.json         # generated SHA-256 checksums
```

`plugin.zip` is the portable Interface-only package. It is accepted because the manifest explicitly declares `contains_engine_plugin: false` and `contains_interface_plugin: true`. Native Engine plugins still require platform-specific ZIPs; separate `plugin-debug.zip` assets are not supported. The root `plugin.json` must also exist in the tagged source. Upload this same manifest directly to the release:

```json
{
  "id": "checklists",
  "name": "DARTWIC Checklists",
  "description": "First-party collaborative Markdown checklists and DARTWIC chips.",
  "author": "Kempton Burton",
  "version": "2.1.0",
  "minInterfaceVersion": "2.0.0",
  "contains_engine_plugin": false,
  "contains_interface_plugin": true,
  "minEngineVersion": "2.0.0"
}
```

The single ZIP has this exact layout:

```text
plugin/
  interface/checklists/plugin.json
  interface/checklists/ui/index.js
  interface/checklists/assets/README.md
```

Run `npm ci`, `npm test`, `npm run typecheck`, then `npm run package`. The last command generates one portable `plugin.zip` from the Interface-only JavaScript output and removes obsolete platform ZIPs. There are no native binaries or separate Debug variant, and no C++ toolchain or vcpkg is required.

The plugin version, root manifest, and every manifest inside the ZIP must match. Publish a new version for changed assets. DARTWIC offers this portable package on every Interface host and displays an Any platform badge. This rule never supplies a native Engine library. The full external-developer contract is in [Packaging and Installation](https://github.com/kemptonburton/dartwic-example-plugin#github-release-contract).

## Asset ownership

Managed files in this repository's `assets/` ship inside the installed plugin and
are replaced with it. Keep custom shared files in
`workspace/assets/plugins/<plugin-id>/` using the SDK helpers. Project settings
remain project-scoped; local secrets and runtime data belong to Engine instances.
Workspaces contain authored Git-trackable content; installed Engine and Interface
directories contain replaceable software and local state. Plugin installation
does not copy files into workspaces. See `assets/README.md` for the storage rules.
