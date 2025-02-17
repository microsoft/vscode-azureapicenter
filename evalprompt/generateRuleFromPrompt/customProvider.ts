// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import "@azure/openai/types";
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
    const apiVersion = "2024-08-01-preview";
    const client = new AzureOpenAI({ azureADTokenProvider, deployment, apiVersion });

    const result = await client.chat.completions.create({
      messages: [
        { role: "user", content: prompt }
      ],
      model: "",
      max_tokens: 16384
    });

    const ret: ProviderResponse = {
      output: result.choices[0].message.content
    };
    return ret;
  }
}
