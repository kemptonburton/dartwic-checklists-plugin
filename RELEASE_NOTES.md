# DARTWIC Checklists 2.0.5

- Ships one portable `plugin.zip` for this Interface-only JavaScript plugin, with no duplicate Windows/Linux packages.
- Declares `contains_engine_plugin: false` and `contains_interface_plugin: true`; native Engine plugins continue to require platform-specific ZIPs.
- Includes the matching `plugin.json` and SHA-256 receipt. Requires DARTWIC Interface 2.0.0 or newer.
- README documents the uploaded assets and complete archive layout. Packaging needs no native toolchain.
