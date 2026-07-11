# finora-api

Scalable production-ready Express + TypeScript boilerplate configured for seamless local development and production Vercel serverless deployments.

## Getting Started

### Prerequisites
*   Node.js >= 18.0.0
*   npm

### Installation
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```

### Production Build
To compile the TypeScript project locally:
```bash
npm run build
```

## Folder Structure
```
finora-server/
├── tsconfig.json
├── vercel.json
├── package.json
├── .gitignore
├── README.md
├── api/
│   └── index.ts (Vercel serverless entrypoint)
└── src/
    ├── app.ts (Express app setup)
    ├── server.ts (Local runner)
    ├── common/
    │   ├── config/ (environment configuration)
    │   └── middleware/ (error & validation handlers)
    └── modules/
        └── health/
            ├── controller.ts
            └── routes.ts
```
