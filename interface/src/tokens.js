export function splitChannelReference(value) {
    const match = String(value ?? "").trim().match(/^\|([^|]+)\|(?::([a-z_]+))?$/i);
    return match ? {channelName: match[1], field: match[2] || "value"} : {channelName: "", field: ""};
}

export function formatChannelValue(value) {
    if (value === undefined || value === null) return "--";
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "number" && Number.isFinite(value)) {
        return Number.isInteger(value) ? String(value) : value.toFixed(Math.abs(value) >= 100 ? 1 : 3).replace(/\.?0+$/, "");
    }
    return String(value);
}

export function parseResourceToken(content) {
    const fullPath = String(content ?? "").trim().replace(/^\/+/, "");
    const index = fullPath.indexOf("/");
    return index > 0 && index < fullPath.length - 1
        ? {fullPath, resourceName: fullPath.slice(0, index), resourcePath: fullPath.slice(index + 1)}
        : null;
}

export function parseEncodedOption(value, fallback = null) {
    try { return value ? JSON.parse(decodeURIComponent(value)) : fallback; } catch { return fallback; }
}

export function formatEncodedOption(value) {
    return value == null ? "" : encodeURIComponent(JSON.stringify(value)).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function parseChannelToken(content, tokenType = "display") {
    const parts = String(content ?? "").split(";").map((part) => part.trim()).filter(Boolean);
    const channelReference = parts.find((part) => !part.includes("=")) ?? "";
    const options = Object.fromEntries(parts.filter((part) => part.includes("=")).map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index).trim().toLowerCase(), part.slice(index + 1).trim()];
    }));
    return {
        tokenType,
        channelReference,
        showName: ["1", "true", "yes", "on"].includes(String(options.name ?? "").toLowerCase()),
        showUnits: ["1", "true", "yes", "on"].includes(String(options.units ?? "").toLowerCase()),
        configData: parseEncodedOption(options.config),
        options
    };
}

function formatChannelParts(token) {
    const parts = [token.channelReference];
    if (token.showName) parts.push("name=1");
    if (token.showUnits) parts.push("units=1");
    if (token.configData) parts.push(`config=${formatEncodedOption(token.configData)}`);
    return parts.filter(Boolean).join("; ");
}

export const formatChannelDisplay = (token) => `@channel-display(${formatChannelParts(token)})`;
export const formatChannelButton = (token) => `@channel-button(${formatChannelParts(token)})`;

export function parseEmbedToken(content, key) {
    const normalized = String(content ?? "").trim().replace(/^\/+/, "");
    const size = /^(.*)\|(\d+)x(\d+)$/.exec(normalized);
    const value = size ? size[1] : normalized;
    const index = value.lastIndexOf("#");
    if (index <= 0 || index === value.length - 1) return null;
    const schematicPath = value.slice(0, index).trim();
    return {
        schematicPath: schematicPath.startsWith("schematics/") ? schematicPath : `schematics/${schematicPath}`,
        [key]: value.slice(index + 1).trim(),
        width: size ? Number(size[2]) : null,
        height: size ? Number(size[3]) : null
    };
}

export function formatEmbedToken(token, key) {
    if (!token?.schematicPath || !token?.[key]) return "";
    return `${token.schematicPath}#${token[key]}${token.width && token.height ? `|${Math.round(token.width)}x${Math.round(token.height)}` : ""}`;
}
