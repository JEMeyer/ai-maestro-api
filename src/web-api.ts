import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { getAllComputers } from './services/tables/computers';
import { getAllGPUs } from './services/tables/gpus';
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
} from './services/tables/assignments';
import { getAllDiffusors } from './services/tables/diffusors';
import { loadModel, makeContainer, removeAllContainers } from './services/edge';
import { createAssignmentGPU } from './services/tables/assignmentGpus';
import computersRouter from './routes/computers';
import gpusRouter from './routes/computers';
import modelsRouter from './routes/models';

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

app.use('/api/computers', computersRouter);
app.use('/api/gpus', gpusRouter);
app.use('/api/models', modelsRouter);

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
