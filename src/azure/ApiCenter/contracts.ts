/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export type ApiCenter = {
    id: string;
    location: string;
    name: string;
    resourceGroup: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};


export type ApiCenterApi = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        type: string;
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterEnvironment = {
    id: string;
    location: string;
    name: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterApiVersion = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        lifecycleStage: string;
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterApiDeployment = {
    id: string;
    location: string;
    name: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterApiVersionDefinition = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        specification: {
            name: string;
            version: string;
        }
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterApiVersionDefinitionImport = {
    format: string;
    value: string;
    specificationDetails: {
        name: string
        version: string
    }
};

export type ApiCenterApiVersionDefinitionExport = {
    id: string;
    value: string;
};
