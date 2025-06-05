# MCP Service Setup Guide

## Introduction
This guide provides step-by-step instructions for setting up the MCP (Multi-Context Problem) service, which helps in tracking development issues and integrating with tools like Obsidian and VSCode.

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (Node package manager)
- Git

## Installation Steps

### 1. Clone the Repository
Start by cloning the MCP service repository to your local machine:
```bash
git clone <repository-url>
cd mcp-copilot-logger
```

### 2. Install Dependencies
Run the following command to install the required dependencies:
```bash
npm install
```

### 3. Configure the MCP Service
Edit the configuration file located at `src/config/default.json` to set your preferences. You can specify options such as logging levels, file paths, and integration settings.

### 4. Set Up Git Hooks
To automatically log changes when commits are made, run the following script:
```bash
bash scripts/install-git-hooks.sh
```
This will install the necessary Git hooks.

### 5. Set Up Obsidian Integration
If you want to integrate with Obsidian, run the setup script:
```bash
bash scripts/setup-obsidian.sh
```
This will configure the necessary paths and settings for exporting logs to your Obsidian vault.

### 6. Start the MCP Service
To start the MCP service, run:
```bash
npm start
```
This will initialize the server and set up the necessary middleware and routes.

## Usage
Once the service is running, you can begin tracking problems and logging interactions with Copilot. The service will automatically capture relevant data and allow you to export it to Obsidian in markdown format.

## Troubleshooting
If you encounter any issues during setup, check the following:
- Ensure all dependencies are installed correctly.
- Verify that the configuration file is set up properly.
- Check the logs in the `.mcp/logs` directory for any error messages.

## Conclusion
You have successfully set up the MCP service. For further information on using the service and its features, refer to the other documentation files in the `docs` directory.