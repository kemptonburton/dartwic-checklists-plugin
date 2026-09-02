import { createHostComponent } from "../internal/createHostComponent.ts";
import { getHostApi } from "../internal/host.ts";
import type {ChannelComboBoxProps, ConfigurableInputProps, ManualRefreshButtonProps, ModuleInstanceSelectProps} from "./types.ts";

/** Selects a DARTWIC channel and, optionally, one of its fields. @dartwic-reference @category DARTWIC UI Components */
export const ChannelComboBox = createHostComponent<ChannelComboBoxProps>("ChannelComboBox", (hostApi) => hostApi.helpers.ChannelComboBox);
/** Edits a configurable literal, channel reference, or expression value. @dartwic-reference @category DARTWIC UI Components */
export const ConfigurableInput = createHostComponent<ConfigurableInputProps>("ConfigurableInput", (hostApi) => hostApi.helpers.ConfigurableInput);
/** Renders the standard refresh icon button with an in-progress state. @dartwic-reference @category DARTWIC UI Components */
export const ManualRefreshButton = createHostComponent<ManualRefreshButtonProps>("ManualRefreshButton", (hostApi) => hostApi.helpers.ManualRefreshButton);
/** Selects only module instances owned by the requested plugin and compatible module types. @dartwic-reference @category DARTWIC UI Components */
export const ModuleInstanceSelect = createHostComponent<ModuleInstanceSelectProps>("ModuleInstanceSelect", (hostApi) => hostApi.helpers.ModuleInstanceSelect);
export const ResourceParticipantsIcon = createHostComponent<Record<string, unknown>>("ResourceParticipantsIcon", (hostApi) => hostApi.components.ResourceParticipantsIcon);
export const ResourceSyncStatusIcon = createHostComponent<Record<string, unknown>>("ResourceSyncStatusIcon", (hostApi) => hostApi.components.ResourceSyncStatusIcon);
export const EmbeddedRemoteView = createHostComponent<Record<string, unknown>>("EmbeddedRemoteView", (hostApi) => hostApi.components.EmbeddedRemoteView);
export const EmbeddedSchematicNode = createHostComponent<Record<string, unknown>>("EmbeddedSchematicNode", (hostApi) => hostApi.components.EmbeddedSchematicNode);

/**
 * Converts a value reference such as `|channel|` into its channel name.
 *
 * @dartwic-reference
 * @category DARTWIC UI Components
 * @param value Channel reference to normalize.
 * @returns The channel name contained in the reference.
 */
export function convertChannelReferenceToChannelName(value: string) {
    const convert = getHostApi().helpers.convertChannelReferenceToChannelName;
    if (typeof convert !== "function") {
        throw new Error("The interface host does not provide convertChannelReferenceToChannelName.");
    }
    return String(convert(value));
}

export function getParticipantAccentColor(clientId: string) {
    const helper = getHostApi().helpers.getParticipantAccentColor;
    if (typeof helper !== "function") {
        throw new Error("The interface host does not provide getParticipantAccentColor.");
    }
    return String(helper(clientId));
}

export type {ChannelComboBoxProps, ConfigurableInputProps, ManualRefreshButtonProps, ModuleInstanceSelectProps} from "./types.ts";
