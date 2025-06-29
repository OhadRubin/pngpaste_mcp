# pngpaste_mcp

An MCP (Model Context Protocol) server that enables AI models to directly access images from your system clipboard.

## Overview

This server provides a seamless way for AI models to see and analyze images you've copied to your clipboard. Simply copy any image (screenshot, image from web, etc.) and the model can immediately access and analyze it.

## Features

- **Direct clipboard access**: Capture images directly from system clipboard
- **No file management**: No need to save images to disk first
- **Instant workflow**: Copy image → ask model → get analysis
- **Error handling**: Graceful handling of missing images or dependencies

## Requirements

- macOS (uses `pngpaste` which is macOS-specific)
- [pngpaste](https://github.com/jcsalterego/pngpaste) - Install with: `brew install pngpaste`
- Node.js and npm

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install pngpaste:
   ```bash
   brew install pngpaste
   ```

## Usage

1. Build the server:
   ```bash
   npm run build
   ```

2. Run the server:
   ```bash
   npx fastmcp dev server.ts
   ```

3. Copy any image to your clipboard (Cmd+C, screenshot, etc.)

4. Use the `getClipboardImage` tool through your MCP client to have the model analyze the image

5. Add the following to your mcp configuration:

```json
{
...   
"view_clipboard": {
            "command": "npx",
            "args": [
                "tsx",
                "/path/to/pngpaste_mcp/server.ts",

            ],

        }
...
}
```


## Available Tools

- **getClipboardImage**: Captures and displays the current image from your system clipboard

## Example Workflow

1. Take a screenshot (Cmd+Shift+4)
2. Ask your AI assistant: "What do you see in my clipboard?"
3. The model immediately receives and analyzes the screenshot

## Development

- `npm run build` - Build the TypeScript project
- `npm run dev` - Watch mode for development
- `npm start` - Run the built server

## License

MIT