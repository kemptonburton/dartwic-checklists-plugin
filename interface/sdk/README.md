# Interface Plugin SDK

The DARTWIC 2.0 interface SDK has one authoring pattern: define a plugin and register each contribution through the registry passed to `register`.

```jsx
import {definePlugin} from "@dartwic/interface-sdk";

export default definePlugin({
  id: "my_plugin",
  name: "My Plugin",
  register(registry) {
    registry.addTaskUi({id: "read", name: "Read Task", card: ReadCard, editor: ReadEditor});
    registry.addModuleUi({id: "device", name: "Device", icon: DeviceIcon, panel: DevicePanel});
    registry.addResource({id: "reports", name: "Reports", type: "component", component: Reports});
    registry.addSchematicNode({
      id: "gauge",
      name: "Gauge",
      component: Gauge,
      dataDefaults: {label: "Gauge"},
      palette: {defaults: {width: 160, height: 80}},
    });
    registry.addSettingsPanel({id: "general", name: "Settings", component: Settings});
  },
});
```

IDs passed to the registry are local. The host validates them and exposes them as `<plugin-id>.<local-id>`. Duplicate IDs in a category fail plugin loading instead of replacing another registration.

The runtime entry is deliberately small:

```js
import {registerPlugin} from "@dartwic/interface-sdk/runtime";
import plugin from "./plugin.jsx";

registerPlugin(plugin);
```

Build output is `ui/index.js`. The live registry supplies installed-plugin contribution counts; packages contain no generated contribution metadata.

Schematic node renderers and configuration UI are interface-owned. Place engine-readable palette JSON beneath `files/workspace/global_data/schematic_nodes/...`; installation mirrors it into the engine configuration root.

Public entrypoints include the main registry types, `tasks`, `resources`, `plugin-settings`, `module-configs`, `schematic-nodes`, `hooks`, `ui`, `utils`, `runtime`, `react`, and the Tailwind preset.

## Stable resource identities

Resource contribution IDs remain plugin-qualified, but a plugin can preserve an established storage and navigation identity with `resourceName`:

```jsx
registry.addResource({
  id: "editor",
  name: "Checklists",
  resourceName: "checklists",
  type: "directory",
  icon: ChecklistsIcon,
  component: ChecklistsEditor,
});
```

The contribution above is `checklists.editor`; its runtime, file, tab, link, and collaboration identity is `checklists`. Runtime names must be safe single path segments and cannot collide with core or other loaded resources.

Resource components receive the typed `ResourceComponentProps` contract. It includes initial reads, error/loading callbacks, live edits, presence, sync status, and `saveResourceContent(content, {silent: true})` for debounced autosaves that should not emit success toasts.

## Host Markdown and chips

Import the shared renderer from `@dartwic/interface-sdk/markdown`:

```jsx
import {MarkdownRenderer, defineMarkdownChip} from "@dartwic/interface-sdk/markdown";
```

`MarkdownRenderer` is host-owned and renders ordinary Markdown unless a specific instance receives chip definitions. A `defineMarkdownChip` descriptor supplies an ID, token parser, serializer, and React renderer; the interface host turns it into the private TipTap/ProseMirror extension. Channel drop behavior is similarly opt-in through `getChannelDropActions`.

Use `editorRef` for `getMarkdown`, `setMarkdown`, `applyRemoteEdits`, `focusHeading`, `getPresenceSnapshot`, and `hasFocus`. Plugin code must use `@dartwic/interface-sdk/react` and host SDK UI/Markdown abstractions. Do not bundle another React runtime or import TipTap/ProseMirror.
