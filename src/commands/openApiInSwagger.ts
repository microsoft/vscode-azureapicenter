// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
/* eslint-disable @typescript-eslint/naming-convention */

import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import { ViewColumn, window } from "vscode";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { swaggerTemplate } from "../tree/Editors/openApi/swaggerTemplate";
import { createTemporaryFolder } from "../utils/fsUtil";
import { inferDefinitionFileType } from "../utils/inferDefinitionFileType";
import { serve } from "../utils/server";

// placeholder in the swagger template
const UrlPlaceHolder = '{{apiDefinitionTmpFilePath}}';
const SwaggerHtmlFileName = 'index.html';
const StaticPublicFolderName = '/public';

export async function openAPiInSwagger(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
  // create temp folder
  const folderPath = await createTemporaryFolder(StaticPublicFolderName);

  // create temp file of the swagger definition
  const definitionFileRaw = await ext.openApiEditor.getData(node);
  const definitionFileType = inferDefinitionFileType(definitionFileRaw);
  const definitionFileName = "apiDefinition" + definitionFileType;
  fse.writeFile(path.join(folderPath, definitionFileName), definitionFileRaw);

  // create temp file of the swagger template
  const swaggerHtmlRaw = swaggerTemplate.replace(UrlPlaceHolder, definitionFileName);
  await fse.writeFile(path.join(folderPath, SwaggerHtmlFileName), swaggerHtmlRaw);

  // serve the swagger template
  const { address, server } = await serve(folderPath, SwaggerHtmlFileName);

  // create a webview panel to show the swagger template
  const previewPanel = window.createWebviewPanel(
    "swaggerPreview",
    node.apiCenterApiName,
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  previewPanel.webview.html = provideTextDocumentContent(address);

  previewPanel.onDidDispose(
    () => {
      server.close();
    },
    null,
    ext.context.subscriptions
  );

  // TODO: have a setting to open in browser if user prefers
  // await env.openExternal(Uri.parse(address));
}

function provideTextDocumentContent(previewUrl: string): string {
  return `
			<html>
				<body style="margin:0px;padding:0px;overflow:hidden">
					<div style="position:fixed;height:100%;width:100%;">
					<iframe src="${previewUrl}" frameborder="0" style="overflow:hidden;height:100%;width:100%" height="100%" width="100%"></iframe>
					</div>
				</body>
			</html>
		`;
}



