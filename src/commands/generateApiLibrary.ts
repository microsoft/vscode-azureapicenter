// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable @typescript-eslint/naming-convention */

import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';
import { UiStrings } from '../uiStrings';
import { EnsureExtension } from '../utils/ensureExtension';

const KiotaExtensionId = 'ms-graph.kiota';

export async function generateApiLibrary(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    EnsureExtension.ensureExtension(context, {
        extensionId: KiotaExtensionId,
        noExtensionErrorMessage: UiStrings.NoKiotaExtension,
    });

    const path = await ext.openApiEditor.createTempFileFromTree(node);
    const descriptionUrl = encodeURIComponent(path);
    const uriScheme = vscode.env.uriScheme;

    const deepLink = `${uriScheme}://${KiotaExtensionId}/OpenDescription?descriptionUrl=${descriptionUrl}`;
    const uri = vscode.Uri.parse(deepLink);
    // don't wait
    void vscode.env.openExternal(uri);
}
