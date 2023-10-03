# VS Code Chat Agent Sample Extension

This extension illustrates how an extension can register a `@teams` chat agent that helps a user create a project in VS Code and access the Copilot LLM in the chat agent handler. The agent contributes two subcommands, `/generate` and `/examples`, which are surfaced in the Copilot Chat view.

<video src="agent.mp4" controls autoplay loop title="Teams chat agent"></video>

The extension uses VS Code proposed API which is subject to change until finalization. Please review all the proposals in the [typings](./src/typings) directory.

## Development
1. `npm install`
2. Install the pre-release of Copilot Chat
3. `F5` to start debugging

## Usage

> **Note: this extension sample requires VS Code 1.83.0 or newer.**

1. Install the VSIX in VS Code
2. Ensure you are on the pre-release of Copilot Chat
3. Run `code --enable-proposed-api ms-vscode.chat-agent-sample`
4. Open the chat view and type / to see slash commands show up