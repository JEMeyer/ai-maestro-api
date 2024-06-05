import express from 'express';
import {
  createComputer,
  deleteComputer,
  getAllComputers,
} from './services/tables/computers';
import { createGPU, deleteGPU, getAllGPUs } from './services/tables/gpus';
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
} from './services/tables/assignments';
import { createLLM, deleteLLM } from './services/tables/llms';
import {
  createDiffusor,
  deleteDiffusor,
  getAllDiffusors,
} from './services/tables/diffusors';
import {
  createSpeechModel,
  deleteSpeechModel,
} from './services/tables/speechModels';
import { loadModel, makeContainer, removeAllContainers } from './services/edge';
import { createAssignmentGPU } from './services/tables/assignmentGpus';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/api/ensure-containers', async (req, res) => {
  const [computers, gpus, diffusors, assignments] = await Promise.all([
    getAllComputers(),
    getAllGPUs(),
    getAllDiffusors(),
    getAllAssignments(),
  ]);

  // First down all the containers, then re-make the ones we want
  computers.forEach(async (computer) => {
    await removeAllContainers(computer.ipAddr);
  });

  // Loop through each model, start the containers, load the model in each container
  const makeAndLoadContainerPromises: Promise<Response>[] = [];
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

// Computers
app.post('/api/computers', async (req, res) => {
  const { name, ipAddr } = req.body;
  const id = await createComputer(name, ipAddr);
  res.json({ id });
});

app.delete('/api/computers/:id', async (req, res) => {
  const { id } = req.params;
  await deleteComputer(Number(id));
  res.sendStatus(204);
});

// GPUs
app.post('/api/gpus', async (req, res) => {
  const { name, vramSize, computerId, weight } = req.body;
  const id = await createGPU(name, vramSize, computerId, weight);
  res.json({ id });
});

app.delete('/api/gpus/:id', async (req, res) => {
  const { id } = req.params;
  await deleteGPU(Number(id));
  res.sendStatus(204);
});

// Models
app.post('/api/models', async (req, res) => {
  const { name, size, type } = req.body;

  let id;
  switch (type) {
    case 'llm':
      id = await createLLM(name, size);
      break;
    case 'diffusor':
      id = await createDiffusor(name, size);
      break;
    case 'stt':
    case 'tts':
      id = await createSpeechModel(name, size, type);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }

  res.json({ id });
});

app.delete('/api/models/:name', async (req, res) => {
  const { name } = req.params;
  const { type } = req.query;

  switch (type) {
    case 'llm':
      await deleteLLM(name);
      break;
    case 'diffusor':
      await deleteDiffusor(name);
      break;
    case 'stt':
    case 'tts':
      await deleteSpeechModel(name);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }
  res.sendStatus(204);
});

// Assignments
app.post('/api/assignments', async (req, res) => {
  const { model, gpuIds, name } = req.body as {
    model: string;
    gpuIds: number[];
    name: string;
  };
  const port = 1;
  const assignmentId = await createAssignment(name, model, port);
  await Promise.all([
    gpuIds.map((gpuId) => createAssignmentGPU(assignmentId, gpuId)),
  ]);
  res.sendStatus(201);
});

app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.body;
  await deleteAssignment(id);
  res.sendStatus(204);
});

// Start server
app.listen(3000, async () => {
  console.log('Master server listening on port 3000');
});
