# DARTWIC Checklists 2.1.0

- Refresh the bundled Interface SDK, including config-map types, and rebuild the Interface bundle.
- Interface-only: no Engine ABI dependency; Interface host compatibility remains 1 and minimum Engine/Interface versions remain 2.0.0.
- Prepared locally for the DARTWIC 2.1 bundle; not published.

# DARTWIC Checklists 2.0.5

- Ships one portable `plugin.zip` for this Interface-only JavaScript plugin, with no duplicate Windows/Linux packages.
- Declares `contains_engine_plugin: false` and `contains_interface_plugin: true`; native Engine plugins continue to require platform-specific ZIPs.
- Includes the matching `plugin.json` and SHA-256 receipt. Requires DARTWIC Interface 2.0.0 or newer.
- README documents the uploaded assets and complete archive layout. Packaging needs no native toolchain.
