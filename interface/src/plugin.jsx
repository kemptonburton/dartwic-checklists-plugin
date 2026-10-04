import React from "../sdk/react.ts";
import {definePlugin} from "../sdk/index.ts";
import {ChecklistsEditor, ChecklistEmptyContextPanel} from "./editor.jsx";

function ListChecksIcon({className = "", size = 20, ...props}) {
    return <svg {...props} className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="m3 17 2 2 4-4"/><path d="M13 18h8"/></svg>;
}

function MarkdownFileIcon({className = ""}) {
    return <svg className={`${className || "h-5 w-5"} flex-shrink-0`} viewBox="0 0 16 16" aria-hidden="true">
        <text
            x="2"
            y="11"
            fill="#6ea0ff"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fontSize="8.4"
            fontWeight="700"
        >M</text>
        <path d="M10 4.25v6.1" stroke="#6ea0ff" strokeWidth="1.35" strokeLinecap="round"/>
        <path
            d="M7.7 8.05 10 10.35l2.3-2.3"
            fill="none"
            stroke="#6ea0ff"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>;
}

export default definePlugin({
    id: "checklists",
    name: "DARTWIC Checklists",
    register(registry) {
        registry.addResource({
            id: "editor",
            name: "Checklists",
            resourceName: "checklists",
            icon: ListChecksIcon,
            label: "Checklists",
            context_label: "Markdown Chip Context",
            context_default_content: ChecklistEmptyContextPanel,
            type: "directory",
            component: ChecklistsEditor,
            file_extension: "md",
            file_extensions: ["md"],
            excluded_file_names: [],
            excluded_paths: [],
            tree_file_icon: MarkdownFileIcon,
            tree_directory_icon: null,
            show_file_extensions: false,
            enable_directory_resource_groups: true,
            resource_on_create_file_data: "# New Checklist\n\n- [ ] First item\n"
        });
    }
});
