import { FastMCP } from "fastmcp";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create the MCP server
const server = new FastMCP({
    name: "Clipboard Image Server",
    version: "1.0.0",
    instructions: `This server provides tools to capture and display images directly from the system clipboard using pngpaste.`,
});

// Check if pngpaste is available
async function checkPngpasteAvailable(): Promise<boolean> {
    try {
        await execAsync('which pngpaste');
        return true;
    } catch {
        return false;
    }
}

// Add tool to capture and display clipboard image
server.addTool({
    name: "getClipboardImage",
    description: "Capture and display the current image from the system clipboard",
    parameters: z.object({}),
    execute: async () => {
        try {
            // Check if pngpaste is available
            const isPngpasteAvailable = await checkPngpasteAvailable();
            if (!isPngpasteAvailable) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "Error: pngpaste is not installed. Please install it with: brew install pngpaste",
                        },
                    ],
                };
            }

            // Use pngpaste to capture clipboard image to stdout and encode as base64
            const { stdout } = await execAsync('pngpaste -', { encoding: 'buffer' });
            const base64Image = stdout.toString('base64');

            return {
                content: [
                    {
                        type: "text",
                        text: "Here is the current image from your clipboard:",
                    },
                    {
                        type: "image",
                        data: base64Image,
                        mimeType: "image/png",
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error capturing clipboard image: ${error.message}. Make sure you have an image copied to your clipboard.`,
                    },
                ],
            };
        }
    },
});

// Parse command line arguments for transport type
function parseArgs() {
    const args = process.argv.slice(2);
    let transportType: "httpStream" | "stdio" = "stdio"; // default

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--transport" || args[i] === "-t") {
            const nextArg = args[i + 1];
            if (nextArg === "httpStream" || nextArg === "stdio") {
                transportType = nextArg;
            }
            i++; // Skip the next argument since we consumed it
        } else if (args[i] === "--help" || args[i] === "-h") {
            process.exit(0);
        }
    }

    return { transportType };
}

const { transportType } = parseArgs();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

const startConfig = transportType === "httpStream"
    ? {
        transportType: transportType as "httpStream",
        httpStream: {
            port: PORT,
            endpoint: "/mcp" as const,
        },
    }
    : {
        transportType: transportType as "stdio",
    };

server.start(startConfig).then(() => {
    // Server started successfully
}).catch((_error: any) => {
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    process.exit(0);
});