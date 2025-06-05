#!/bin/bash

# This script installs necessary Git hooks for the MCP project.

# Define the hooks directory
HOOKS_DIR=".git/hooks"

# Create a pre-commit hook
cat << 'EOF' > "$HOOKS_DIR/pre-commit"
#!/bin/bash
# Pre-commit hook to log changes before committing
echo "Logging changes before commit..."
# Call the MCP logging function (replace with actual command)
# node path/to/mcp-logger.js
EOF

# Make the pre-commit hook executable
chmod +x "$HOOKS_DIR/pre-commit"

# Create a post-commit hook
cat << 'EOF' > "$HOOKS_DIR/post-commit"
#!/bin/bash
# Post-commit hook to perform actions after commit
echo "Post-commit actions..."
# Call the MCP post-commit function (replace with actual command)
# node path/to/mcp-post-commit.js
EOF

# Make the post-commit hook executable
chmod +x "$HOOKS_DIR/post-commit"

echo "Git hooks installed successfully."