## 🐳 Run with Docker

You can easily run HumanAIze using Docker for a consistent and isolated environment.

### Requirements
- Docker and Docker Compose installed on your machine
- Node.js version: **22.13.1** (handled by the Dockerfile)
- Required environment variables (see `.env.example` for details)

### Environment Variables
Before running, copy the example environment file and fill in your API keys:

```shell
cp .env.example .env
```

Make sure to set the following variables in your `.env` file:

```
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_AIML_API_KEY=...
# Optional: Specify a custom base URL for OpenAI-compatible APIs (e.g., local LLM server)
# Defaults to https://api.openai.com/v1 if not set
OPEN_AI_BASE_URL=http://localhost:11434/v1 
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Build and Run
To build and start the app using Docker Compose:

```shell
docker compose up --build
```

This will:
- Build the app using the provided `Dockerfile` (multi-stage, Node.js 22.13.1-slim)
- Start the app in production mode
- Expose the app on **port 3000** (accessible at http://localhost:3000)

### Service Details
- **Service name:** `typescript-app`
- **Exposed port:** `3000` (host → container)
- **Network:** `appnet` (Docker bridge network)
- **User:** Runs as a non-root user for security

### Notes
- If you need to customize environment variables, edit the `.env` file before starting.
- The Docker Compose file is ready for local development and production use.
- For advanced configuration, see the `docker-compose.yml` and `Dockerfile` in the project root.

---
