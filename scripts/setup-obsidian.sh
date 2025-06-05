#!/bin/bash

# This script sets up the integration with Obsidian for the MCP service.

# Define the Obsidian vault path
OBSIDIAN_VAULT_PATH="/Users/zhw/Documents/Obsidian Vault/mcp-copilot-logger"

# Check if the Obsidian vault path exists
if [ ! -d "$OBSIDIAN_VAULT_PATH" ]; then
  echo "Obsidian vault not found at $OBSIDIAN_VAULT_PATH. Please create it first."
  exit 1
fi

# Create necessary directories in the Obsidian vault
mkdir -p "$OBSIDIAN_VAULT_PATH/DevLogs"
mkdir -p "$OBSIDIAN_VAULT_PATH/问题记录"

# Create a sample markdown file to confirm setup
echo "# MCP Service Setup" > "$OBSIDIAN_VAULT_PATH/DevLogs/setup-confirmation.md"
echo "MCP service has been successfully integrated with Obsidian." >> "$OBSIDIAN_VAULT_PATH/DevLogs/setup-confirmation.md"

echo "Obsidian integration setup completed successfully."