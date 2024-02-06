import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFolder } from "../utils/fsUtil";
import { DefinitionFileType, inferDefinitionFileType } from "../utils/inferDefinitionFileType";
import { opticDiff } from "../utils/opticUtils";

export async function compareWithSelected(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    const [filePath1, filePath2] = await Promise.all([
        createDefinitionFile(ext.selectedApiVersionDefinitionTreeItem),
        createDefinitionFile(node!)
    ]);

    opticDiff(filePath1, filePath2);

    const uri1 = vscode.Uri.file(filePath1);
    const uri2 = vscode.Uri.file(filePath2);

    await vscode.commands.executeCommand('vscode.diff', uri1, uri2);
}

async function createDefinitionFile(node: ApiVersionDefinitionTreeItem): Promise<string> {
    const definitionFileRaw = await ext.openApiEditor.getData(node);

    const folderPath = await createTemporaryFolder(`${node.apiCenterName}-${node.apiCenterApiName}`);
    const fileType: DefinitionFileType = inferDefinitionFileType(definitionFileRaw);
    const fileName: string = `${node.apiCenterApiVersionName}-tempFile${fileType}`;
    const filePath = path.join(folderPath, fileName);

    await fse.ensureFile(filePath);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(definitionFileRaw));

    return filePath;
}
