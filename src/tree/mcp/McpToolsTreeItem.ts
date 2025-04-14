// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import * as vscode from 'vscode';
import { ApiSpecExportResultFormat } from "../../azure/ApiCenter/contracts";
import { GeneralUtils } from "../../utils/generalUtils";
import { OpenApiUtils } from "../../utils/openApiUtils";
import { ApiVersionDefinitionTreeItem } from "../ApiVersionDefinitionTreeItem";
import { McpToolTreeItem } from "./McpToolTreeItem";


export class McpToolsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "mcpTools";
    public contextValue: string = McpToolsTreeItem.contextValue;
    constructor(
        parent: AzExtParentTreeItem,
        public apiCenterName: string,
        public apiCenterApiName: string,
        public apiCenterApiVersionName: string,
        public apiCenterApiVersionDefinitionName: string) {
        super(parent);
    }

    public get label(): string {
        return "Tools";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("tools");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const exportedSpec = await (this.parent as ApiVersionDefinitionTreeItem).apiCenterApiVersionDefinition.getDefinitions(this.subscription, this.apiCenterName, this.apiCenterApiName, this.apiCenterApiVersionName);
        const fileContent = (exportedSpec.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(exportedSpec.value) : exportedSpec.value;
        const openApiObject = OpenApiUtils.pasreDefinitionFileRawToSwaggerObject(fileContent) as any;
        const serverUrl = openApiObject.servers?.[0]?.url;
        const sseEndpoint = `${serverUrl}/sse`;

        const transport = new SSEClientTransport(new URL(sseEndpoint));

        const client = new Client(
            {
                name: "example-client",
                version: "1.0.0"
            }
        );

        await client.connect(transport);

        const { tools } = await client.listTools();
        const toolItems: McpToolTreeItem[] = tools.map((tool) => {
            return new McpToolTreeItem(this, client, tool.name, tool.description, tool.inputSchema);
        });

        return toolItems;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
