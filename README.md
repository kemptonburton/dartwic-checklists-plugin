# DARTWIC Checklists Plugin

The first-party interface-only Checklists resource for DARTWIC 2.0. It owns the checklist editor, token grammars, and five Markdown chips while using the interface host's React runtime and shared Markdown renderer.

Requires DARTWIC Engine and Interface 2.0.0 or newer. Core 2.0.0 packages will be published separately.

Installing the plugin exposes the stable `checklists` resource. Uninstalling it only hides the resource; existing files in the engine-managed `checklists/` directory remain untouched and reappear after reinstalling.

## Build

The matching `@dartwic/interface-sdk` 2.0.0 snapshot is bundled under `interface/sdk` and verified against `sdk-lock.json`. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run package` after cloning.
