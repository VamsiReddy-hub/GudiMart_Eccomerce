@echo off
echo Starting GudiMart application in VS Code environment...

:: Set environment variables
set NODE_ENV=development
set REPLIT_ENVIRONMENT=

:: Run the application using cross-env
npx cross-env NODE_ENV=development tsx server/index.ts