/* eslint-disable @typescript-eslint/naming-convention */
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import { Uri, env } from "vscode";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { swaggerTemplate } from "../tree/Editors/openApi/swaggerTemplate";
import { createTemporaryFile } from "../utils/fsUtil";
import { serve } from "../utils/server";

// placeholder in the swagger template
const UrlPlaceHolder = '{{apiDefinitionTmpFilePath}}';
const SwaggerHtmlFileName = 'index.html';

export async function openAPiInSwagger(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    let map = new Map<string, string>();

    // write spec to temp file
    const definitionLocalFilePath = await ext.openApiEditor.createTempFileFromTree(node);
    const definitionLocalFileName = path.basename(definitionLocalFilePath);
    map.set(`/${definitionLocalFileName}`, definitionLocalFilePath);

    // create temp file of the swagger template
    const swaggerHtml = swaggerTemplate.replace(UrlPlaceHolder, definitionLocalFileName);
    const htmlFilePath = await createTemporaryFile(SwaggerHtmlFileName);
    await fse.writeFile(htmlFilePath, swaggerHtml);
    map.set('/', htmlFilePath);

    // serve the swagger template
    const address = serve(map);

    // open web page
    await env.openExternal(Uri.parse(address));
}



