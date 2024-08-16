// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import dotenv from "dotenv";
dotenv.config();
export class Timeout {
    public static readonly CLICK_WAIT = 1000;
    public static readonly CLICK_LONG_WAIT = 3000;
    public static readonly PREPARE_TEST = 5000;
    public static readonly PREPARE_EXT = 10000;
    public static readonly SHORT_WAIT = 5000;
}

export class VSCode {
    // cmd palette
    public static readonly CMD_PALETTE_KEY = "F1";
    public static readonly CMD_PALETTE = "combobox";
    public static readonly CMD_PALETTE_OPTION = "option";
    public static readonly CMD_PALETTE_LIST = "listbox";
    // side tabs
    public static readonly SIDE_TAB = "tab";
    public static readonly TAB_EXPLORER = "Explorer";
    public static readonly TAB_API_CENTER = "API Center";
    // tree items
    public static readonly TREE_ITEM = "treeitem";
    // elements
    public static readonly INPUT = "INPUT";
    public static readonly LINK = "a";
    public static readonly BUTTON = "button";
    // keys
    public static readonly ENTER = "Enter";
    //toolbar
    public static readonly Toolbar = "toolbar";
}

export class APICenter {
    // commands
    public static readonly REGISTER_API = ">Azure API Center: Register API";
    // tree items
    public static readonly SELECT_TENANT = "Select tenant...";
    public static readonly SELECT_SUBS = "Select Subscriptions...";
    // cicd
    public static readonly CI_CD = "CI/CD";
    public static readonly AZURE_DEVOPS = "Azure DevOps";
    public static readonly GITHUB = "GitHub";
    public static readonly REGISTER_API_YML = "register-api.yml";
}

export class TestENV {
    public static readonly AZURE_TENANT_NAME = process.env["AZURE_TENANT_NAME"] || "Microsoft";
    public static readonly AZURE_TENANT_ID = process.env["AZURE_TENANT_ID"] || "72f988bf-86f1-41af-91ab-2d7cd011db47";
    public static readonly AZURE_SUBSCRIPTION_NAME = process.env["AZURE_SUBSCRIPTION_NAME"] || "Teams Cloud - E2E Testing with TTL = 1 Days";
    public static readonly AZURE_TENANT_ID_2 = process.env["AZURE_TENANT_ID"] || "af46c703-f714-4f4c-af42-835a673c2b13";
}
