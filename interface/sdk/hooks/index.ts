import { getHostApi } from "../internal/host.ts";

/** Returns the host's shared DARTWIC React context hook result. @dartwic-reference @category Hooks and Utilities */
export function useDartwic() {
    return getHostApi().useDartwic();
}

function callHostHook(name: string, args: unknown[] = []) {
    const hook = getHostApi().hooks?.[name];
    if (typeof hook !== "function") {
        throw new Error(`The interface host does not provide ${name}.`);
    }
    return hook(...args);
}

/** Current client identity, username, and administrator state. */
export function useClientInfo() {
    return callHostHook("useClientInfo");
}

/** Connected-client presentation and resource-presence helpers. */
export function useConnectedClients() {
    return callHostHook("useConnectedClients");
}

/** Controls the shared bottom context panel. */
export function useBottomContextPanel() {
    return callHostHook("useBottomContextPanel");
}

/** Reads the host's live channel values. */
export function useDartwicChannelValues(...args: unknown[]) {
    return callHostHook("useDartwicChannelValues", args);
}

export function useConfigurableInput(data: Record<string, unknown>) {
    return callHostHook("useConfigurableInput", [data]);
}

export function useIfElseBlock(data: Record<string, unknown>) {
    return callHostHook("useIfElseBlock", [data]);
}

export function useChannelDropTarget(handler: (payload: unknown) => void, options?: Record<string, unknown>) {
    return callHostHook("useChannelDropTarget", [handler, options]);
}

export function useChannelStatusNames(channelValuePaths: string[]) {
    return callHostHook("useChannelStatusNames", [channelValuePaths]);
}

/** Opens resources through the host's docked-layout navigation. */
export function useResourceNavigation() {
    return callHostHook("useResourceNavigation");
}

/** Controls whether remote participants are shown for a resource. */
export function useResourceParticipantVisibility(resourceName: string, resourcePath: string) {
    return callHostHook("useResourceParticipantVisibility", [resourceName, resourcePath]);
}
