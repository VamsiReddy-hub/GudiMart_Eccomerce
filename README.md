# GudiMart - E-commerce Platform

An e-commerce website with Flipkart-like features, dynamic logo, and AI chatbot assistance. This project includes both a shopping platform and a social media content scheduling tool.

## Features

- User authentication (signup, login, logout)
- Product browsing and searching
- Shopping cart functionality
- Product categories
- AI-powered chatbot for customer support
- Social media content scheduling and management

## Running the Project in VS Code

### Prerequisites

- Node.js v18+ installed
- npm or yarn package manager
- Visual Studio Code

### Installation

1. Clone or download this repository
2. Open the project folder in VS Code
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following:

```
# API keys
OPENAI_API_KEY=your_openai_api_key_here

# Environment settings
NODE_ENV=development
```

### Running the Application

#### For Windows Users:

1. Double-click the `run-local.bat` file, or run it from Command Prompt

OR

2. Run the following command in the terminal:

```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

#### For macOS/Linux Users:

1. Make the shell script executable:

```bash
chmod +x run-local.sh
```

2. Run the script:

```bash
./run-local.sh
```

OR

3. Run the following command:

```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

### Accessing the Application

Once running, the application will be available at:

- http://localhost:5000

## Project Structure

- `/client` - React frontend
- `/server` - Express backend
- `/shared` - Shared types and schemas

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, shadcn/ui
- Backend: Express, Node.js
- Database: In-memory storage (MemStorage)
- Authentication: Passport.js with sessions
- AI Integration: OpenAI for chatbot