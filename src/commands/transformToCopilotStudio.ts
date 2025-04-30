// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionImport } from "../azure/ApiCenter/contracts";
import { ApiDeploymentTreeItem } from "../tree/ApiDeploymentTreeItem";

export async function transformToCopilotStudio(context: IActionContext, node: ApiDeploymentTreeItem) {
  const apiTitle = node.apiCenterApi.properties.title;
  const apiDescription = node.apiCenterApi.properties.summary ?? node.apiCenterApi.properties.description ?? apiTitle;
  const runtimeUrl = node.apiCenterApiDeployment.properties.server.runtimeUri[0];

  const copilotStudioMCPServerSpec = transformDeploymentToCopilotStudioMCPServer(apiTitle, apiDescription, runtimeUrl);

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Registering Copilot Studio MCP Server into API Center",
  }, async (progress, token) => {
    await registerCopilotStudioMCPServer(copilotStudioMCPServerSpec, node);
  });

  node.parent!.parent!.refresh(context);
}

function transformDeploymentToCopilotStudioMCPServer(apiTitle: string, apiDescription: string, runtimeUrl: string) {
  const url = new URL(runtimeUrl);
  const host = url.host;
  const path = url.pathname;

  return `swagger: '2.0'

info:
  title: ${apiTitle}
  description: ${apiDescription}
  version: 1.0.0
host: ${host}
basePath: /
schemes:
  - https
definitions:
  QueryResponse:
    type: object
    properties:
      jsonrpc:
        type: string
      id:
        type: string
      method:
        type: string
      params:
        type: object
      result:
        type: object
      error:
        type: object
paths:
  ${path}:
    get:
      summary: MCP Server Actions
      parameters:
        - in: query
          name: sessionId
          type: string
          required: false
      produces:
        - application/json
      responses:
        '200':
          description: Immediate Response
          schema:
            $ref: '#/definitions/QueryResponse'
        '201':
          description: Created and will follow callback
      operationId: InvokeMCP
      tags:
        - Agentic
        - McpSse
securityDefinitions: {}
security: []`;
}

async function registerCopilotStudioMCPServer(copilotStudioMCPServerSpec: string, node: ApiDeploymentTreeItem) {
  const apiCenterService = new ApiCenterService(node.subscription, getResourceGroupFromId(node.id), node.apiCenterName);

  const apiVersion = {
    name: "v1",
    properties: {
      title: "v1",
      lifecycleStage: "testing",
    }
  };
  await apiCenterService.createOrUpdateApiVersion(node.apiCenterApi.name, apiVersion as ApiCenterApiVersion);

  const apiDefinition = {
    name: "copilot-studio-mcp",
    properties: {
      title: "copilot-studio-mcp",
    }
  };
  await apiCenterService.createOrUpdateApiVersionDefinition(node.apiCenterApi.name, apiVersion.name, apiDefinition as ApiCenterApiVersionDefinition);

  const importPayload = {
    format: "inline",
    value: copilotStudioMCPServerSpec,
    specification: {
      name: "openapi",
    }
  };

  const result = await apiCenterService.importSpecification(
    node.apiCenterApi.name,
    apiVersion.name,
    apiDefinition.name,
    importPayload as ApiCenterApiVersionDefinitionImport);

  if (result) {
    vscode.window.showInformationMessage("Copilot Studio MCP Server registered successfully.");
  } else {
    throw new Error("Failed to register Copilot Studio MCP Server.");
  }
}
