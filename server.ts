import { FastMCP } from "fastmcp";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// Create the MCP server
const server = new FastMCP({
    name: "PNG Paste Server",
    version: "1.0.0",
    instructions: `This server provides a tool to read and display the hooray.png image from the user's home directory.`,
});

// Add tool to read and display the hooray.png image
server.addTool({
    name: "getHoorayImage",
    description: "Read and display the hooray.png image from the home directory",
    parameters: z.object({}),
    execute: async () => {
        try {
            const imagePath = join(homedir(), "hooray.png");
            const imageBuffer = readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');

            return {
                content: [
                    {
                        type: "text",
                        text: "Here is the hooray.png image from your home directory:",
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
                        text: `Error reading hooray.png: ${error.message}`,
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
}).catch((_error) => {
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    process.exit(0);
});