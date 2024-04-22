# llm-manager

Orchestrates setting up ollama docker containers and queueing requests to ensure 1 request per gpu.

Database schema

```
CREATE TABLE computers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_addr VARCHAR(15) NOT NULL
);

CREATE TABLE gpus (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vram_size INT NOT NULL,
    computer_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (computer_id) REFERENCES computers(id)
);

CREATE TABLE models (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    container_name VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    port INT NOT NULL
);

CREATE TABLE model_gpu_assignments (
    model_id VARCHAR(36) NOT NULL,
    gpu_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (model_id, gpu_id),
    FOREIGN KEY (model_id) REFERENCES models(id),
    FOREIGN KEY (gpu_id) REFERENCES gpus(id)
);
```
