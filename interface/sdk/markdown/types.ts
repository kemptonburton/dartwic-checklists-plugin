import type {HostEventHandler, HostNode} from "../ui/types.ts";

export type MarkdownMode = "view" | "edit";
export type MarkdownLineNumberMode = "all" | "checkbox" | "off";

export interface MarkdownSelection {
    from: number;
    to: number;
    anchor?: number;
    head?: number;
}

export interface MarkdownRendererHandle {
    getMarkdown(): string;
    setMarkdown(markdown: string): void;
    applyRemoteEdits(changeBatches?: unknown[], fallbackMarkdown?: string | null): boolean;
    focusHeading(idOrPosition: string | number): void;
    getPresenceSnapshot(): MarkdownSelection | null;
    hasFocus(): boolean;
}

export interface MarkdownChipRenderProps<Token = unknown> {
    token: Token;
    tokenId: string;
    canEdit: boolean;
    mode: MarkdownMode;
    commandEnabled: boolean;
    selected: boolean;
    select(): void;
    clearSelection(): void;
    updateToken(nextToken: Token): void;
}

export interface MarkdownChipParseResult<Token = unknown> {
    raw: string;
    token: Token;
}

export interface MarkdownChipDefinition<Token = unknown> {
    id: string;
    prefix?: string;
    start?(source: string): number;
    parse(source: string): MarkdownChipParseResult<Token> | null | undefined;
    serialize(token: Token): string;
    component: (props: MarkdownChipRenderProps<Token>) => HostNode;
}

export interface MarkdownDropAction {
    id: string;
    label: string;
    icon?: HostNode;
    onSelect(): void;
}

export interface MarkdownChannelDropContext {
    channelName: string;
    clientPosition?: {x: number; y: number};
    insertMarkdown(markdown: string): void;
    [name: string]: unknown;
}

export interface MarkdownRemoteParticipant {
    clientId?: string;
    username?: string;
    displayName?: string;
    accentColor?: string;
    avatarImageSrc?: string;
    avatarFallbackText?: string;
    selection?: MarkdownSelection | null;
    cursorPosition?: {x: number; y: number} | null;
    presenceMode?: MarkdownMode;
}

export interface MarkdownRendererProps {
    [name: string]: unknown;
    value: string;
    mode?: MarkdownMode;
    editable?: boolean;
    lightweight?: boolean;
    chips?: MarkdownChipDefinition[];
    getChannelDropActions?: (context: MarkdownChannelDropContext) => MarkdownDropAction[];
    editorRef?: {current: MarkdownRendererHandle | null};
    defaultOrigin?: string;
    commandEnabled?: boolean;
    lineNumberMode?: MarkdownLineNumberMode;
    showToolbar?: boolean;
    showToc?: boolean;
    showGutter?: boolean;
    tocOpen?: boolean;
    closeTocOnHeadingClick?: boolean;
    onTocOpenChange?: (open: boolean) => void;
    onModeChange?: (mode: MarkdownMode) => void;
    onCommandEnabledChange?: (enabled: boolean) => void;
    onLineNumberModeChange?: (mode: MarkdownLineNumberMode) => void;
    onMarkdownChange?: (markdown: string) => void;
    onTransactionBatch?: HostEventHandler;
    onPresenceChange?: (selection: MarkdownSelection) => void;
    onViewCursorPresenceChange?: (position: {x: number; y: number} | null) => void;
    onUndoRedoStateChange?: HostEventHandler;
    onFocusChange?: (focused: boolean) => void;
    onSelectedTokenChange?: (tokenId: string | null) => void;
    remoteParticipants?: Record<string, MarkdownRemoteParticipant>;
    className?: string;
    titleText?: string;
}
