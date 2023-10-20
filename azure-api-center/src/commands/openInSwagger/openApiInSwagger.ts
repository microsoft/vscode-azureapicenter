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

    // get the temp file path that was created from user definition
    const apiDefinitionTmpFilePath = await ext.openApiEditor.createTempFileFromTree(node);
    const fileName = path.parse(apiDefinitionTmpFilePath).base;

    // replace the placeholder in the swagger template with the temp file path
    const swaggerHtml = swaggerTemplate.replace(urlPlaceHolder, fileName);

    // create temp file of the swagger template
    const htmlFilePath = await createTemporaryFile('swagger-ui.html');
    await fse.writeFile(htmlFilePath, swaggerHtml);

    // serve the swagger template
    const address = serve(htmlFilePath);

    // open web page
    await env.openExternal(Uri.parse(address));
}



