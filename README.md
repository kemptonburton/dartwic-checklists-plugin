# DARTWIC Checklists Plugin

The first-party interface-only Checklists resource for DARTWIC 2.0. It owns the checklist editor, token grammars, and five Markdown chips while using the interface host's React runtime and shared Markdown renderer.

Requires DARTWIC Interface 2.0.1 or newer.

Installing the plugin exposes the stable `checklists` resource. Uninstalling it only hides the resource; existing files in the engine-managed `checklists/` directory remain untouched and reappear after reinstalling.

## Build

Copy the matching `@dartwic/interface-sdk` snapshot into `interface/sdk`, then run `npm install` and `npm run build`.
