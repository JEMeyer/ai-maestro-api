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
  getConfiguration,
} from './services/database';

const app = express();

// API endpoint to get available models
// app.get('/api/available-models', async (req, res) => {
//   // call ollama /tags endpoing on one of the containers per machine.
// });

app.get('/api/config', (req, res) => {
  const config = getConfiguration();

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
  const { name, containerName, size, port } = req.body;
  const id = await createModel(name, containerName, size, port);
  res.json({ id });
});

app.delete('/api/models/:id', async (req, res) => {
  const { id } = req.params;
  await deleteModel(id);
  res.sendStatus(204);
});

// Model-GPU Assignments
app.post('/api/assignments', async (req, res) => {
  const { modelId, gpuId } = req.body;
  await createAssignment(modelId, gpuId);
  res.sendStatus(201); // Created
});

app.delete('/api/assignments', async (req, res) => {
  const { modelId, gpuId } = req.body;
  await deleteAssignment(modelId, gpuId);
  res.sendStatus(204);
});

// Start server
app.listen(3000, async () => {
  console.log('Master server listening on port 3000');
});
