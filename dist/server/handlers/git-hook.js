"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGitHooks = void 0;
const child_process_1 = require("child_process");
const GIT_HOOKS_DIR = '.git/hooks';
const POST_COMMIT_HOOK = `${GIT_HOOKS_DIR}/post-commit`;
// Function to create the post-commit hook
const createPostCommitHook = () => {
    const hookContent = `
#!/bin/sh
# MCP Git Hook: Automatically log changes on commit
node path/to/your/logging/script.js
`;
    // Write the hook content to the post-commit file
    (0, child_process_1.exec)(`echo "${hookContent}" > ${POST_COMMIT_HOOK} && chmod +x ${POST_COMMIT_HOOK}`, (error) => {
        if (error) {
            console.error(`Error creating post-commit hook: ${error.message}`);
        }
        else {
            console.log('Post-commit hook created successfully.');
        }
    });
};
// Express handler for setting up Git hooks
const setupGitHooks = (req, res) => {
    createPostCommitHook();
    res.status(200).send('Git hooks setup completed.');
};
exports.setupGitHooks = setupGitHooks;
