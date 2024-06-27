# AI Maestro API

AI Maestro API is an Express server application that orchestrates setting up Ollama Docker containers and manages requests to ensure one request per GPU. This project provides endpoints for managing resources such as computers, GPUs, models, and assignments, making it easier to deploy and manage AI models on edge devices.

## Table of Contents
- [AI Maestro API](#ai-maestro-api)
  - [Table of Contents](#table-of-contents)
  - [Project Structure](#project-structure)
    - [Controllers](#controllers)
    - [Services](#services)
  - [Components](#components)
    - [Controllers](#controllers-1)
    - [Services](#services-1)
    - [Routes](#routes)
  - [Usage](#usage)
    - [Docker Run](#docker-run)
    - [Docker Compose](#docker-compose)
  - [Contributing](#contributing)
  - [License](#license)

## Project Structure
The project is organized into several directories and files, each with its specific role in the application. The main components include:

### Controllers
Controller functions handle HTTP requests and responses for resources such as assignments and computers. They act as intermediaries between models and views and manage data flow within the application.

### Services
Service modules encapsulate the business logic of the application. They provide functions to interact with external APIs or services, perform computations, and handle data manipulation. The project includes database services for managing connections to the database and performing CRUD operations on individual tables. Additionally, there's a service for handling interactions with an edge server running Ollama Docker containers.

## Components

### Controllers
- `src/controllers/*.ts`: Handles HTTP requests and responses for resources such as assignments and computers.

### Services
- `src/services/db.ts`: Manages connections to the database and provides a pool of connections that can be used to execute queries against the database.
- `src/services/tables/*.ts`: Contains service functions for interacting with specific tables in the database, such as `assignment_gpus` and `diffusors`.
- `src/services/edge.ts`: Provides functions to handle interactions with an edge server running Ollama Docker containers, including creating and removing containers, loading models, and handling errors.

### Routes
- `src/routes/*.ts`: Defines the API endpoints and maps them to their corresponding controller functions. These routes handle HTTP requests for resources such as assignments, computers, GPUs, models, and diffusors.


## Usage
To use the AI Maestro API, follow these steps:

1. Clone the repository: `git clone https://github.com/jemeyer/ai-maestro-api.git`
2. Install dependencies: `npm install`
3. Set up environment variables in a `.env` file based on the provided example (`.env.example`).
4. Start the server: `npm run build && npm run start` or `npm run dev` for development mode with automatic reloading.
5. The API will be available at `http://localhost:3000`.

### Docker Run

To use the most recent image, pull the `latest` tag:

```bash
docker run --env-file=.env -p 3000:3000 ghcr.io/jemeyer/ai-maestro-api:latest
```

This will start the server and make it accessible at <http://localhost:3000>.

### Docker Compose

You can also use the proxy server with Docker Compose. Here's an example docker-compose.yml file:

```yaml
services:
  ai-maestro-api:
    image: ghcr.io/jemeyer/ai-maestro-api:latest
    env_file:
      - .env
    ports:
      - '3000:3000'
```

This configuration will start a container using the latest image and make it accessible at <http://localhost:3000>. It will read the .env file for environment variables (SQL connection as well as port used by 'edge' server).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under Apache 2.0 - see the [LICENSE](LICENSE) file for details.
