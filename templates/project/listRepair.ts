import { app, InvocationContext } from "@azure/functions";

// Hello function - responds with hello message
export async function mcpToolListRepairs(_toolArguments: unknown, context: InvocationContext): Promise<string> {
    const mcptoolargs = context.triggerMetadata.mcptoolargs as { snippetname?: string };
    // Extract snippet name from arguments, if provided

    // Define the remote endpoint URL (you can set this as an environment variable in your Azure Function configuration)
    const apiEndpoint = 'https://piercerepairsapi.azurewebsites.net/';

    try {
        // Build URL with optional query parameter
        const url = `${apiEndpoint}/repairs`

        // Make HTTP GET request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return JSON.stringify(data, null, 2);
    } catch (error) {
        context.error(`Error fetching repairs: ${error.message}`);
        return JSON.stringify({ error: 'Failed to fetch repairs data', details: error.message });
    }
}

// Register the hello tool
app.mcpTool('listRepairs', {
    toolName: 'list-Repairs-items',
    description: 'Returns a list of repairs with their details and images',
    handler: mcpToolListRepairs
});
