// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersion, ApiCenterApiVersionDefinition, DataPlaneApiCenterApiVersion, DataPlaneApiCenterApiVersionDefinition } from "./contracts";
export type IVersionBase = {
    getLable: () => string,
    getId: () => string,
    getContext: () => string,
    getChild: (context: ISubscriptionContext) => Promise<IDefinitionBase>
}

export class ApiCenterVersionManagement implements IVersionBase {
    constructor(public data: ApiCenterApiVersion) { }
    async getChild(context: ISubscriptionContext): Promise<IDefinitionBase> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, this._apiCenterName);

        const definitions = await apiCenterService.getApiCenterApiVersionDefinitions(this._apiCenterApiName, this.data.name);
        this._nextLink = definitions.nextLink;
        return definitions.value;
    };
    getLable() {
        return this.data.properties.title;
    }
    getId() {
        return this.data.id;
    }
    getContext() {
        return "azureApiCenterApiVersion"
    }
}

export class ApiCenterVersionDataplane implements IVersionBase {
    constructor(public data: DataPlaneApiCenterApiVersion) { }
    getChild: () => IDefinitionBase;
    getLable() {
        return this.data.name;
    }
    getId() {
        return this.data.name;
    }
    getContext() {
        return "azureApiCenterApiVersion"
    }
}

export type IDefinitionBase = {
    getLabel: () => string,
    getId: () => string,
    getContext: () => string,
}

export class ApiCenterVersionDefinitionManagement implements IDefinitionBase {
    constructor(public data: ApiCenterApiVersionDefinition) {
    }
    getContext() {
        return "azureApiCenterApiVersionDefinitionTreeItem" + this.data.properties.specification.name.toLowerCase();
    };
    getLabel() {
        return this.data.properties.title;
    };
    getId() {
        return this.data.id;
    };
}

export class ApiCenterVersionDefinitionDataPlane implements IDefinitionBase {
    constructor(public data: DataPlaneApiCenterApiVersionDefinition) { }
    getContext() {
        return "azureApiCenterApiVersionDataPlaneDefinitionTreeItem" + this.data.name.toLowerCase();
    };
    getLabel() {
        return this.data.name;
    };
    getId() {
        return this.data.name;
    };
}
