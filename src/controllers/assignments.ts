import { Request, Response } from 'express';
import * as AssignmentService from '../services/tables/assignments';
import * as AssignmentGpuService from '../services/tables/assignmentGpus';
import * as DiffusorService from '../services/tables/diffusors';
import * as GpuService from '../services/tables/gpus';
import * as ComputerService from '../services/tables/computers';
import * as EdgeServerService from '../services/edge';
import { Assignment } from '../services/tables/types';

export const getAllAssignments = async (_req: Request, res: Response) => {
  const assignments = await AssignmentService.getAllAssignments();
  const assignmentGpus = await AssignmentGpuService.getAllDBAssignmentGPUs();

  const returnArray: Assignment[] = [...assignments].map((assignment) => {
    return {
      ...assignment,
      gpuIds: assignmentGpus
        .filter(({ assignmentId }) => assignmentId === assignment.id)
        .map(({ gpuId }) => gpuId),
    };
  });

  res.json(returnArray);
};

export const getAssignmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const assignment = await AssignmentService.getAssignmentById(Number(id));
  if (assignment != null) res.json(assignment);
  else res.sendStatus(404);
};

export const createAssignment = async (req: Request, res: Response) => {
  const { name, modelName, port, gpuIds } = req.body as {
    name: string;
    modelName: string;
    port: number;
    gpuIds: number[];
  };
  const assignmentId = await AssignmentService.createAssignment(
    name,
    modelName,
    port
  );
  await Promise.all(
    gpuIds.map((gpuId) =>
      AssignmentGpuService.createDBAssignmentGPU(assignmentId, gpuId)
    )
  );
  res.json({ assignmentId });
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idAsNumber = Number(id);
  await AssignmentService.deleteAssignment(idAsNumber);
  await AssignmentGpuService.deleteDBAssignmentGPUsByAssignmentId(idAsNumber);
  res.sendStatus(204);
};

export const updateAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, modelName, port, gpuIds } = req.body as {
    name: string;
    modelName: string;
    port: number;
    gpuIds: number[];
  };
  const idAsNumber = Number(id);

  // First update the assignment record, and pull all current assignmentGpus
  const [affectedARows, currentAssignmentGpus] = await Promise.all([
    AssignmentService.updateAssignment(idAsNumber, name, modelName, port),
    AssignmentGpuService.getDBAssignmentGPUsByAssignmentId(idAsNumber),
  ]);

  // Now look to see which assignment gpus we need to delete/create
  await Promise.all(
    gpuIds
      .map((gpuId) => {
        if (!currentAssignmentGpus.find((ag) => ag.gpuId === gpuId)) {
          return AssignmentGpuService.createDBAssignmentGPU(idAsNumber, gpuId);
        }
      })
      .concat(
        currentAssignmentGpus
          .map((ag) => {
            if (!gpuIds.find((gpuId) => ag.gpuId === gpuId)) {
              return AssignmentGpuService.deleteAssignmentGpu(
                idAsNumber,
                ag.gpuId
              );
            }
          })
          .filter(Boolean)
      )
  );
  res.json({ affectedARows });
};

export const deployAssignments = async (req: Request, res: Response) => {
  const [computers, gpus, diffusors, assignments, assignmentGpus] =
    await Promise.all([
      ComputerService.getAllComputers(),
      GpuService.getAllGPUs(),
      DiffusorService.getAllDiffusors(),
      AssignmentService.getAllAssignments(),
      AssignmentGpuService.getAllDBAssignmentGPUs(),
    ]);

  // First down all the containers, then re-make the ones we want
  computers.forEach(async (computer) => {
    await EdgeServerService.removeAllContainers(computer.ipAddr);
  });

  // Loop through each model, start the containers, load the model in each container
  const makeAndLoadContainerPromises: Promise<void>[] = [];
  assignments.forEach((assignment) => {
    const ipAddr = computers.find(({ id }) => {
      return id === gpus[0].computerId;
    })?.ipAddr;
    const isDiffusionModel = diffusors.some(
      ({ name }) => name === assignment.modelName
    );
    if (ipAddr != null) {
      makeAndLoadContainerPromises.push(
        (async () => {
          await EdgeServerService.makeContainer(ipAddr, {
            containerName: assignment.name,
            port: String(assignment.port),
            gpuIds: assignmentGpus
              .filter(({ assignmentId }) => assignment.id === assignmentId)
              .map(({ gpuId }) => gpuId),
            diffusionModel: isDiffusionModel ? assignment.modelName : undefined,
          });

          await EdgeServerService.loadModel(ipAddr, {
            containerName: assignment.name,
            modelName: assignment.modelName,
            mode: isDiffusionModel ? 'diffusion' : undefined,
          });
        })()
      );
    }
  });
  await Promise.all(makeAndLoadContainerPromises);

  res.sendStatus(200);
};
