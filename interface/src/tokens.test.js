import test from "node:test";
import assert from "node:assert/strict";
import {
    formatChannelButton,
    formatChannelDisplay,
    formatEmbedToken,
    parseChannelToken,
    parseEmbedToken,
    parseResourceToken
} from "./tokens.js";

test("all checklist token grammars round-trip their stored Markdown", () => {
    assert.deepEqual(parseResourceToken("checklists/example.md"), {fullPath: "checklists/example.md", resourceName: "checklists", resourcePath: "example.md"});
    const display = {channelReference: "|temperature|", showName: true, showUnits: true};
    assert.equal(formatChannelDisplay(parseChannelToken("|temperature|; name=1; units=1")), "@channel-display(|temperature|; name=1; units=1)");
    assert.equal(formatChannelButton(parseChannelToken("|enable|; name=1", "button")), "@channel-button(|enable|; name=1)");
    const remote = parseEmbedToken("schematics/main.json#overview|480x280", "remoteViewName");
    assert.equal(formatEmbedToken(remote, "remoteViewName"), "schematics/main.json#overview|480x280");
    const node = parseEmbedToken("schematics/main.json#pump-1|240x160", "nodeId");
    assert.equal(formatEmbedToken(node, "nodeId"), "schematics/main.json#pump-1|240x160");
    assert.equal(display.channelReference, "|temperature|");
});
