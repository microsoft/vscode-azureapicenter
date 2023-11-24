/* eslint-disable @typescript-eslint/naming-convention */
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';
import { ensureExtension } from '../utils/ensureExtension';

const KiotaExtensionId = 'ms-graph.kiota';

export async function generateApiLibrary(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    ensureExtension(context, {
        extensionId: KiotaExtensionId,
        noExtensionErrorMessage: 'Please install the Kiota extension to generate the API library.',
    });

    const path = await ext.openApiEditor.createTempFileFromTree(node);
    const descriptionUrl = encodeURIComponent(path);
    const uriScheme = vscode.env.uriScheme;

    const deepLink = `${uriScheme}://${KiotaExtensionId}/OpenDescription?descriptionUrl=${descriptionUrl}`;
    const uri = vscode.Uri.parse(deepLink);
    // don't wait
    void vscode.env.openExternal(uri);
}
