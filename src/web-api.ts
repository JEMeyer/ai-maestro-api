import express from 'express';
import {
  createAssignment,
  createComputer,
  createGPU,
  createModel,
  deleteAssignment,
  deleteComputer,
  deleteGPU,
  deleteModel,
  getCurrentConfig,
  readConfigFile,
} from './services/database';
import { updateModelToServerMapping } from './utilities/configuration';
import { loadModel, makeContainer, removeAllContainers } from './services/node';
import { AxiosResponse } from 'axios';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/api/config', async (req, res) => {
  const { fromFile }: { fromFile: boolean } = req.body;
  const config = fromFile ? await readConfigFile() : getCurrentConfig();

  res.json(config);
});

// Computers
app.post('/api/computers', async (req, res) => {
  const { name, ipAddr } = req.body;
  const id = await createComputer(name, ipAddr);
  res.json({ id });
});

app.delete('/api/computers/:id', async (req, res) => {
  const { id } = req.params;
  await deleteComputer(id);
  res.sendStatus(204); // No Content
});

// GPUs
app.post('/api/gpus', async (req, res) => {
  const { name, vramSize, computerId } = req.body;
  const id = await createGPU(name, vramSize, computerId);
  res.json({ id });
});

app.delete('/api/gpus/:id', async (req, res) => {
  const { id } = req.params;
  await deleteGPU(id);
  res.sendStatus(204);
});

// Models
app.post('/api/models', async (req, res) => {
  const { name, size, type } = req.body;
  const id = await createModel(name, size, type);
  res.json({ id });
});

app.delete('/api/models/:name', async (req, res) => {
  const { name } = req.params;
  await deleteModel(name);
  res.sendStatus(204);
});

// Model-GPU Assignments
app.post('/api/assignments', async (req, res) => {
  const { model, gpuId, name } = req.body;
  await createAssignment(model, gpuId, name);
  res.sendStatus(201); // Created
});

app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.body;
  await deleteAssignment(id);
  res.sendStatus(204);
});

// Refresh the mapping in the proxy server - will start routing to the mapping immediately
app.post('/api/refresh-proxy-mapping', async (_req, res) => {
  await updateModelToServerMapping();
  res.sendStatus(200);
});

app.post('/api/ensure-containers', async (req, res) => {
  const { computers, gpus, diffusors, assignments } = await readConfigFile();

  // First down all the containers, then re-make the ones we want
  computers.forEach(async (computer) => {
    await removeAllContainers(computer.ipAddr);
  });

  // Loop through each model, start the containers, load the model in each container
  const makeAndLoadContainerPromises: Promise<AxiosResponse>[] = [];
  assignments.forEach(async (assignment) => {
    const ipAddr = computers.find(({ id }) => {
      return id === gpus[0].computerId;
    })?.ipAddr;
    const isDiffusionModel = diffusors.some(
      ({ name }) => name === assignment.modelName
    );

    if (ipAddr != null) {
      makeAndLoadContainerPromises.push(
        makeContainer(ipAddr, {
          containerName: assignment.name,
          port: String(assignment.port),
          gpuIds: assignment.gpuIds,
          diffusionModel: isDiffusionModel ? assignment.modelName : undefined,
        }).then(() =>
          loadModel(ipAddr, {
            containerName: assignment.name,
            modelName: assignment.modelName,
            port: assignment.port,
          })
        )
      );
    }
  });

  await Promise.all(makeAndLoadContainerPromises);

  res.sendStatus(200);
});

// Start server
app.listen(3000, async () => {
  console.log('Master server listening on port 3000');
});
