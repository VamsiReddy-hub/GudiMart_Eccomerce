#!/bin/bash
echo "Starting GudiMart application in VS Code environment..."

# Set environment variables
export NODE_ENV=development
export REPLIT_ENVIRONMENT=""

# Run the application using cross-env
npx cross-env NODE_ENV=development tsx server/index.ts