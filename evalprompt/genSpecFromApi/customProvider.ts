// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import "@azure/openai/types";
// import { Spectral } from "@stoplight/spectral-core";
// import { truthy } from "@stoplight/spectral-functions"; // this has to be installed as well
import "dotenv/config";
import { AzureOpenAI } from "openai";
import type { ApiProvider, ProviderOptions, ProviderResponse } from 'promptfoo';
export default class CustomApiProvider implements ApiProvider {
    protected providerId: string;
    public config: any;

    constructor(options: ProviderOptions) {
        // The caller may override Provider ID (e.g. when using multiple instances of the same provider)
        this.providerId = options.id || 'custom provider';

        // The config object contains any options passed to the provider in the config file.
        this.config = options.config;
    }

    id(): string {
        return this.providerId;
    }

    async callApi(prompt: string): Promise<ProviderResponse> {
        const scope = "https://cognitiveservices.azure.com/.default";
        const azureADTokenProvider = getBearerTokenProvider(new DefaultAzureCredential(), scope);
        const deployment = "gpt-4o";
        const apiVersion = "2024-05-01-preview";
        const client = new AzureOpenAI({ azureADTokenProvider, deployment, apiVersion });
        const result = await client.chat.completions.create({
            messages: [
                { role: "user", content: prompt }
            ],
            model: "",
            max_tokens: 128
        });

        // spectral ruleset with the response
        // const spectralResult = await this.spectralValidation(result.choices[0].message.content);
        // console.log('==== 2:', spectralResult);
        const ret: ProviderResponse = {
            output: result.choices[0].message.content
        };
        return ret;
    }

    // async spectralValidation(spec: string | null): Promise<string> {
    //     const spectral = new Spectral();
    //     spectral.setRuleset({
    //         // this will be our ruleset
    //         rules: {
    //             "no-empty-description": {
    //                 given: "$..description",
    //                 message: "Description must not be empty",
    //                 then: {
    //                     function: truthy,
    //                 },
    //             },
    //         },
    //     });
    //     const res = await spectral.run(spec!);
    //     return JSON.stringify(res);
    // }
}
