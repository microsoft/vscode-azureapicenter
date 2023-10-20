import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import { Uri, env } from "vscode";
import { ext } from "../../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../../tree/ApiVersionDefinitionTreeItem";
import { swaggerTemplate } from "../../tree/Editors/openApi/swaggerTemplate";
import { createTemporaryFile } from "../../utils/fsUtil";
import { serve } from "./server";
import path = require("path");

const urlPlaceHolder = '{{apiDefinitionTmpFilePath}}';

export async function openAPiInSwagger(context: IActionContext, node: ApiVersionDefinitionTreeItem) {

    // write spec to temp file
    const definitionRaw = await ext.openApiEditor.getData(node);
    const apiDefinitionTmpFilePath = await createTemporaryFile('/uploads/definition.json');
    await fse.writeFile(apiDefinitionTmpFilePath, definitionRaw);

    // replace the placeholder in the swagger template with the temp file path
    const swaggerHtml = swaggerTemplate.replace(urlPlaceHolder, '/uploads/definition.json');

    // create temp file of the swagger template
    const htmlFilePath = await createTemporaryFile('index.html');
    await fse.writeFile(htmlFilePath, swaggerHtml);

    // serve the swagger template
    const address = serve([htmlFilePath, apiDefinitionTmpFilePath]);

    // open web page
    await env.openExternal(Uri.parse(address));
}



