import React from "../sdk/react.ts";
import {MarkdownRenderer} from "../sdk/markdown/index.ts";
import {
    useBottomContextPanel,
    useClientInfo,
    useConnectedClients,
    useDartwic,
    useResourceParticipantVisibility
} from "../sdk/hooks/index.ts";
import {getParticipantAccentColor, ResourceParticipantsIcon, ResourceSyncStatusIcon} from "../sdk/ui/dartwic.ts";
import {checklistChips, getChecklistChannelDropActions} from "./chips.jsx";

const SAVE_DEBOUNCE_MS = 120;
const PRESENCE_STALE_MS = 2000;
const PRESENCE_INTERVAL_MS = 300;

export function ChecklistEmptyContextPanel() {
    return <div className="inline-flex rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">Select Markdown chip</div>;
}

function editorId() {
    return globalThis.crypto?.randomUUID?.() ?? `checklists-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChecklistsEditor({
    resource_name,
    resource_path,
    setIsLoaded,
    setErrorState,
    getResourceContent,
    saveResourceContent,
    onLiveResourceChange,
    onLiveResourcePresence,
    sendLiveResourceChange,
    sendLiveResourcePresence,
    sendResourceSyncStatus
}) {
    const {client} = useDartwic();
    const {clientInfo} = useClientInfo();
    const {getConnectedClientPresentation} = useConnectedClients();
    const {isParticipantVisibilityEnabled} = useResourceParticipantVisibility(resource_name, resource_path);
    const contextPanel = useBottomContextPanel();
    const editorRef = React.useRef(null);
    const sourceEditorId = React.useRef(editorId());
    const markdownRef = React.useRef("");
    const serverMarkdownRef = React.useRef("");
    const pendingBatches = React.useRef([]);
    const saveTimer = React.useRef(null);
    const presenceTimer = React.useRef(null);
    const remoteExpiry = React.useRef(new Map());
    const [markdown, setMarkdown] = React.useState(null);
    const [mode, setMode] = React.useState("view");
    const [lineNumberMode, setLineNumberMode] = React.useState("all");
    const [tocOpen, setTocOpen] = React.useState(false);
    const [commandEnabled, setCommandEnabled] = React.useState(false);
    const [remoteParticipants, setRemoteParticipants] = React.useState({});

    const visibleParticipants = React.useMemo(() => {
        if (!isParticipantVisibilityEnabled) return {};
        return Object.fromEntries(Object.entries(remoteParticipants).map(([clientId, participant]) => {
            const presentation = getConnectedClientPresentation(clientId, participant.username);
            return [clientId, {
                ...participant,
                displayName: presentation.displayName,
                accentColor: getParticipantAccentColor(clientId),
                avatarImageSrc: presentation.avatar_image_src,
                avatarFallbackText: presentation.avatar_image_placeholder_text
            }];
        }));
    }, [getConnectedClientPresentation, isParticipantVisibilityEnabled, remoteParticipants]);

    const publishPresence = React.useCallback((selection = null, cursorPosition = null) => {
        void sendLiveResourcePresence?.({
            kind: "position",
            mode,
            clientId: client?.clientId,
            username: clientInfo?.client_username,
            selection: mode === "edit" ? (selection ?? editorRef.current?.getPresenceSnapshot?.()) : null,
            cursorPosition: mode === "view" ? cursorPosition : null,
            timestamp: Date.now()
        });
    }, [client?.clientId, clientInfo?.client_username, mode, sendLiveResourcePresence]);

    const flush = React.useCallback(async () => {
        if (!clientInfo?.admin) {
            pendingBatches.current = [];
            return;
        }
        const changeBatches = pendingBatches.current;
        pendingBatches.current = [];
        if (!changeBatches.length && markdownRef.current === serverMarkdownRef.current) return;
        void sendResourceSyncStatus?.({kind: "syncing", active: true});
        try {
            await Promise.all([
                sendLiveResourceChange?.({sourceEditorId: sourceEditorId.current, changeBatches, fullContent: markdownRef.current}),
                saveResourceContent(markdownRef.current, {silent: true}).then((result) => {
                    if (result?.error) throw new Error(result?.payload?.error ?? "Unknown save error");
                    serverMarkdownRef.current = markdownRef.current;
                })
            ]);
        } catch (error) {
            setErrorState({error: true, message: `Server failed to save checklist: ${error instanceof Error ? error.message : String(error)}`});
        } finally {
            void sendResourceSyncStatus?.({kind: "syncing", active: false});
        }
    }, [clientInfo?.admin, saveResourceContent, sendLiveResourceChange, sendResourceSyncStatus, setErrorState]);

    const scheduleFlush = React.useCallback(() => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void flush(), SAVE_DEBOUNCE_MS);
    }, [flush]);

    React.useEffect(() => {
        let cancelled = false;
        setIsLoaded(false);
        void sendResourceSyncStatus?.({kind: "pulling", active: true});
        void getResourceContent().then((content) => {
            if (cancelled) return;
            const next = content ?? "";
            markdownRef.current = next;
            serverMarkdownRef.current = next;
            setMarkdown(next);
        }).finally(() => {
            if (!cancelled) setIsLoaded(true);
            void sendResourceSyncStatus?.({kind: "pulling", active: false});
        });
        return () => { cancelled = true; };
    }, [getResourceContent, resource_name, resource_path, sendResourceSyncStatus, setIsLoaded]);

    React.useEffect(() => onLiveResourceChange?.((telemetry) => {
        const update = telemetry?.payload ?? {};
        if (update.sourceEditorId === sourceEditorId.current) return;
        const fallback = typeof update.fullContent === "string" ? update.fullContent : null;
        const batches = Array.isArray(update.changeBatches) ? update.changeBatches : [];
        if (batches.length && editorRef.current?.applyRemoteEdits?.(batches, fallback)) {
            const next = editorRef.current.getMarkdown();
            markdownRef.current = next;
            setMarkdown(next);
            if (fallback !== null) serverMarkdownRef.current = fallback;
        } else if (fallback !== null) {
            editorRef.current?.setMarkdown?.(fallback);
            markdownRef.current = fallback;
            serverMarkdownRef.current = fallback;
            setMarkdown(fallback);
        }
    }), [onLiveResourceChange]);

    React.useEffect(() => onLiveResourcePresence?.((telemetry) => {
        const payload = telemetry?.payload ?? {};
        const id = String(payload.clientId ?? telemetry?.sender ?? "");
        if (!id || id === client?.clientId) return;
        clearTimeout(remoteExpiry.current.get(id));
        if (payload.kind === "closed" || (!payload.selection && !payload.cursorPosition)) {
            setRemoteParticipants((previous) => { const next = {...previous}; delete next[id]; return next; });
            return;
        }
        setRemoteParticipants((previous) => ({...previous, [id]: {
            clientId: id,
            username: String(payload.username ?? "Unknown user"),
            selection: payload.selection ?? null,
            cursorPosition: payload.cursorPosition ?? null,
            presenceMode: payload.mode ?? "view"
        }}));
        remoteExpiry.current.set(id, setTimeout(() => {
            setRemoteParticipants((previous) => { const next = {...previous}; delete next[id]; return next; });
        }, PRESENCE_STALE_MS));
    }), [client?.clientId, onLiveResourcePresence]);

    React.useEffect(() => {
        presenceTimer.current = setInterval(() => publishPresence(), PRESENCE_INTERVAL_MS);
        return () => clearInterval(presenceTimer.current);
    }, [publishPresence]);

    React.useEffect(() => () => {
        clearTimeout(saveTimer.current);
        clearInterval(presenceTimer.current);
        for (const timeout of remoteExpiry.current.values()) clearTimeout(timeout);
        if (markdownRef.current !== serverMarkdownRef.current && clientInfo?.admin) void flush();
        void sendLiveResourcePresence?.({kind: "closed", clientId: client?.clientId, username: clientInfo?.client_username});
    }, [client?.clientId, clientInfo?.admin, clientInfo?.client_username, flush, sendLiveResourcePresence]);

    React.useEffect(() => {
        contextPanel.setTitle("Markdown Chip Context");
        contextPanel.setMode("default");
        contextPanel.setContent(<ChecklistEmptyContextPanel />);
    }, [contextPanel]);

    if (markdown === null) return null;
    return <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="absolute right-3 top-2 z-20 flex gap-1">
            <ResourceParticipantsIcon resource_name={resource_name} resource_path={resource_path} />
            <ResourceSyncStatusIcon resource_name={resource_name} resource_path={resource_path} />
        </div>
        <MarkdownRenderer
            value={markdown}
            editorRef={editorRef}
            chips={checklistChips}
            getChannelDropActions={getChecklistChannelDropActions}
            mode={mode}
            editable={Boolean(clientInfo?.admin)}
            commandEnabled={commandEnabled}
            lineNumberMode={lineNumberMode}
            showToolbar={mode === "edit" && Boolean(clientInfo?.admin)}
            showToc
            showGutter
            tocOpen={tocOpen}
            closeTocOnHeadingClick={false}
            onTocOpenChange={setTocOpen}
            onModeChange={setMode}
            onCommandEnabledChange={setCommandEnabled}
            onLineNumberModeChange={setLineNumberMode}
            onMarkdownChange={(value) => {markdownRef.current = value; setMarkdown(value);}}
            onTransactionBatch={(batch) => {if (clientInfo?.admin) {pendingBatches.current.push(batch); scheduleFlush();}}}
            onPresenceChange={(selection) => clientInfo?.admin && publishPresence(selection)}
            onViewCursorPresenceChange={(position) => mode === "view" && publishPresence(null, position)}
            remoteParticipants={visibleParticipants}
            className="h-full"
        />
    </div>;
}
