/* eslint-disable @typescript-eslint/naming-convention */
import { IActionContext } from '@microsoft/vscode-azext-utils';
import { commands } from 'vscode';
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';
import { ensureExtension } from '../utils/ensureExtension';

const SwaggerExtensionId = 'arjun.swagger-viewer';
const SwaggerPreviewCommandId = 'swagger.preview';

export async function openApiDocInSwagger(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    ensureExtension(context, {
        extensionId: SwaggerExtensionId,
        noExtensionErrorMessage: 'Cannot open API Documentation unless the Swagger extension is installed.',
    });

    // don't wait
    void ext.openApiEditor.showEditor(node);
    await commands.executeCommand(SwaggerPreviewCommandId);
}
