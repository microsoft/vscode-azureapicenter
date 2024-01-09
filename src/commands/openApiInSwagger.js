"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAPiInSwagger = void 0;
const fse = require("fs-extra");
const path = require("path");
const vscode_1 = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const swaggerTemplate_1 = require("../tree/Editors/openApi/swaggerTemplate");
const fsUtil_1 = require("../utils/fsUtil");
const inferDefinitionFileType_1 = require("../utils/inferDefinitionFileType");
const server_1 = require("../utils/server");
// placeholder in the swagger template
const UrlPlaceHolder = '{{apiDefinitionTmpFilePath}}';
const SwaggerHtmlFileName = 'index.html';
const StaticPublicFolderName = '/public';
async function openAPiInSwagger(context, node) {
    // create temp folder
    const folderPath = await (0, fsUtil_1.createTemporaryFolder)(StaticPublicFolderName);
    // create temp file of the swagger definition
    const definitionFileRaw = await extensionVariables_1.ext.openApiEditor.getData(node);
    const definitionFileType = (0, inferDefinitionFileType_1.inferDefinitionFileType)(definitionFileRaw);
    const definitionFileName = "apiDefinition" + definitionFileType;
    fse.writeFile(path.join(folderPath, definitionFileName), definitionFileRaw);
    // create temp file of the swagger template
    const swaggerHtmlRaw = swaggerTemplate_1.swaggerTemplate.replace(UrlPlaceHolder, definitionFileName);
    await fse.writeFile(path.join(folderPath, SwaggerHtmlFileName), swaggerHtmlRaw);
    // serve the swagger template
    const address = (0, server_1.serve)(folderPath, SwaggerHtmlFileName);
    // create a webview panel to show the swagger template
    const previewPanel = vscode_1.window.createWebviewPanel("swaggerPreview", node.apiCenterApiName, vscode_1.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
    });
    previewPanel.webview.html = provideTextDocumentContent(address);
    previewPanel.onDidDispose(() => { }, null, extensionVariables_1.ext.context.subscriptions);
    // TODO: have a setting to open in browser if user prefers
    // await env.openExternal(Uri.parse(address));
}
exports.openAPiInSwagger = openAPiInSwagger;
function provideTextDocumentContent(previewUrl) {
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
//# sourceMappingURL=openApiInSwagger.js.map