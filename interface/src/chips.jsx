import React from "../sdk/react.ts";
import {defineMarkdownChip} from "../sdk/markdown/index.ts";
import {useBottomContextPanel, useDartwic, useDartwicChannelValues, useResourceNavigation} from "../sdk/hooks/index.ts";
import {Button, Input} from "../sdk/ui/general.ts";
import {EmbeddedRemoteView, EmbeddedSchematicNode} from "../sdk/ui/dartwic.ts";
import {
    formatChannelButton,
    formatChannelDisplay,
    formatChannelValue,
    formatEmbedToken,
    parseChannelToken,
    parseEmbedToken,
    parseResourceToken,
    splitChannelReference
} from "./tokens.js";

const chipClass = "relative z-10 inline-flex min-h-6 items-center rounded-md border border-border bg-muted px-1.5 font-mono text-xs text-foreground";
const selectedClass = " ring-2 ring-primary/50";

function tokenDescriptor(id, prefix, parseToken, serializeToken, component) {
    return defineMarkdownChip({
        id,
        prefix,
        parse(source) {
            const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const match = new RegExp(`^${escaped}([^\\n)]+)\\)`).exec(source);
            if (!match || !parseToken(match[1].trim())) return null;
            return {raw: match[0], token: match[1].trim()};
        },
        serialize: serializeToken,
        component
    });
}

function ConfigInput({value, onChange, placeholder}) {
    return <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-8 w-full px-2 text-xs normal-case" />;
}

function openTokenPanel({openPanel}, title, content) {
    openPanel({title, mode: "custom-unscrolled", content});
}

function ResourceChip({token, canEdit, mode, selected, select, updateToken}) {
    const resource = React.useMemo(() => parseResourceToken(token), [token]);
    const contextPanel = useBottomContextPanel();
    const {openResource} = useResourceNavigation();
    if (!resource) return `@resource(${token})`;
    return (
        <button type="button" className={`${chipClass}${selected ? selectedClass : ""}`} onMouseDown={(event) => {
            if (!(canEdit && mode === "edit")) return;
            event.preventDefault(); event.stopPropagation(); select();
            openTokenPanel(contextPanel, "Resource Link", <ConfigInput value={token} onChange={(value) => parseResourceToken(value) && updateToken(value)} placeholder="resource/path" />);
        }} onClick={(event) => {
            if (canEdit && mode === "edit") return;
            event.preventDefault(); event.stopPropagation();
            openResource({resource_name: resource.resourceName, filePath: resource.resourcePath, tabLabel: resource.resourcePath.split("/").at(-1)});
        }}>@ {resource.resourcePath.split("/").at(-1)}</button>
    );
}

function getChannelValue(channels, reference) {
    const {channelName, field} = splitChannelReference(reference);
    return channels?.[channelName]?.channel_data?.[field || "value"];
}

function ChannelConfig({token, type, updateToken}) {
    const parsed = parseChannelToken(token, type);
    const [reference, setReference] = React.useState(parsed.channelReference);
    const formatter = type === "button" ? formatChannelButton : formatChannelDisplay;
    return <div className="grid gap-2 p-1"><ConfigInput value={reference} onChange={(value) => {
        setReference(value);
        if (splitChannelReference(value).channelName) updateToken(formatter({...parsed, channelReference: value}).replace(/^@[^()]+\(|\)$/g, ""));
    }} placeholder="|channel|:field" /></div>;
}

function ChannelDisplayChip({token, canEdit, mode, selected, select, updateToken}) {
    const parsed = React.useMemo(() => parseChannelToken(token, "display"), [token]);
    const {channelName} = splitChannelReference(parsed.channelReference);
    const channels = useDartwicChannelValues(channelName ? [channelName] : []);
    const {addChannelToTelemetry, removeChannelFromTelemetry} = useDartwic();
    const contextPanel = useBottomContextPanel();
    React.useEffect(() => {
        if (!channelName) return undefined;
        addChannelToTelemetry(channelName);
        return () => removeChannelFromTelemetry(channelName);
    }, [addChannelToTelemetry, channelName, removeChannelFromTelemetry]);
    const value = formatChannelValue(getChannelValue(channels, parsed.channelReference));
    const text = [parsed.showName ? channelName : "", value, parsed.showUnits ? channels?.[channelName]?.channel_data?.units : ""].filter(Boolean).join(" ");
    return <code className={`${chipClass}${selected ? selectedClass : ""}`} onMouseDown={(event) => {
        if (!(canEdit && mode === "edit")) return;
        event.preventDefault(); event.stopPropagation(); select();
        openTokenPanel(contextPanel, "Channel Display", <ChannelConfig token={token} type="display" updateToken={updateToken} />);
    }}>{text || "--"}</code>;
}

function ChannelButtonChip({token, canEdit, mode, commandEnabled, selected, select, updateToken}) {
    const parsed = React.useMemo(() => parseChannelToken(token, "button"), [token]);
    const {channelName, field} = splitChannelReference(parsed.channelReference);
    const channels = useDartwicChannelValues(channelName ? [channelName] : []);
    const {operation, addChannelToTelemetry, removeChannelFromTelemetry} = useDartwic();
    const contextPanel = useBottomContextPanel();
    const [commanding, setCommanding] = React.useState(false);
    React.useEffect(() => {
        if (!channelName) return undefined;
        addChannelToTelemetry(channelName);
        return () => removeChannelFromTelemetry(channelName);
    }, [addChannelToTelemetry, channelName, removeChannelFromTelemetry]);
    const value = getChannelValue(channels, parsed.channelReference);
    return <Button type="button" variant="outline" size="sm" className={`${chipClass}${selected ? selectedClass : ""}`} disabled={mode !== "edit" && (!commandEnabled || commanding)} onMouseDown={(event) => {
        if (!(canEdit && mode === "edit")) return;
        event.preventDefault(); event.stopPropagation(); select();
        openTokenPanel(contextPanel, "Channel Button", <ChannelConfig token={token} type="button" updateToken={updateToken} />);
    }} onClick={async (event) => {
        if (mode === "edit" || !commandEnabled || commanding || !channelName) return;
        event.preventDefault(); event.stopPropagation(); setCommanding(true);
        try {
            const configured = parsed.configData?.toggle_update ?? {};
            const onValue = configured?.trueValueConfigurableInput?.value ?? "1";
            const offValue = configured?.falseValueConfigurableInput?.value ?? "0";
            await operation("rapid/upsert-channel-field", {channel_name: channelName, field: field || "value", value: String(value) === String(offValue) ? onValue : offValue});
        } finally { setCommanding(false); }
    }}>{parsed.showName ? `${channelName} ` : ""}{formatChannelValue(value)}</Button>;
}

function EmbedConfig({token, keyName, updateToken}) {
    const parsed = parseEmbedToken(token, keyName) ?? {};
    const update = (field, value) => updateToken(formatEmbedToken({...parsed, [field]: value}, keyName));
    return <div className="grid gap-2 p-1"><ConfigInput value={parsed.schematicPath} onChange={(value) => update("schematicPath", value)} placeholder="schematics/example.json" /><ConfigInput value={parsed[keyName]} onChange={(value) => update(keyName, value)} placeholder={keyName} /></div>;
}

function RemoteViewChip({token, canEdit, mode, commandEnabled, selected, select, updateToken}) {
    const parsed = parseEmbedToken(token, "remoteViewName");
    const panel = useBottomContextPanel();
    if (!parsed) return `@remote-view(${token})`;
    return <div className={`inline-flex overflow-hidden rounded-md border border-border${selected ? selectedClass : ""}`} style={{width: parsed.width || 480, height: parsed.height || 280}} onMouseDown={(event) => {
        if (!(canEdit && mode === "edit")) return;
        event.preventDefault(); event.stopPropagation(); select(); openTokenPanel(panel, "Remote View", <EmbedConfig token={token} keyName="remoteViewName" updateToken={updateToken} />);
    }}><EmbeddedRemoteView commandEnabled={commandEnabled} schematicPath={parsed.schematicPath} remoteViewName={parsed.remoteViewName} /></div>;
}

function SchematicNodeChip({token, canEdit, mode, commandEnabled, selected, select, updateToken}) {
    const parsed = parseEmbedToken(token, "nodeId");
    const panel = useBottomContextPanel();
    if (!parsed) return `@schematic-node(${token})`;
    return <div className={`inline-flex overflow-hidden rounded-md border border-border${selected ? selectedClass : ""}`} style={{width: parsed.width || 240, height: parsed.height || 160}} onMouseDown={(event) => {
        if (!(canEdit && mode === "edit")) return;
        event.preventDefault(); event.stopPropagation(); select(); openTokenPanel(panel, "Schematic Node", <EmbedConfig token={token} keyName="nodeId" updateToken={updateToken} />);
    }}><EmbeddedSchematicNode commandEnabled={commandEnabled} schematicPath={parsed.schematicPath} nodeId={parsed.nodeId} /></div>;
}

export const checklistChips = [
    tokenDescriptor("resource-link", "@resource(", parseResourceToken, (token) => `@resource(${token})`, ResourceChip),
    tokenDescriptor("channel-display", "@channel-display(", (token) => parseChannelToken(token, "display"), (token) => `@channel-display(${token})`, ChannelDisplayChip),
    tokenDescriptor("channel-button", "@channel-button(", (token) => parseChannelToken(token, "button"), (token) => `@channel-button(${token})`, ChannelButtonChip),
    tokenDescriptor("remote-view", "@remote-view(", (token) => parseEmbedToken(token, "remoteViewName"), (token) => `@remote-view(${token})`, RemoteViewChip),
    tokenDescriptor("schematic-node", "@schematic-node(", (token) => parseEmbedToken(token, "nodeId"), (token) => `@schematic-node(${token})`, SchematicNodeChip)
];

export function getChecklistChannelDropActions({channelName, insertMarkdown}) {
    const channelReference = `|${channelName}|`;
    return [
        {id: "checklists.channel-display", label: "Channel display", onSelect: () => insertMarkdown(formatChannelDisplay({channelReference, showName: true, showUnits: true}))},
        {id: "checklists.channel-button", label: "Channel button", onSelect: () => insertMarkdown(formatChannelButton({channelReference, showName: true, showUnits: true}))}
    ];
}
