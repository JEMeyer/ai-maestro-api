import { Request, Response } from 'express';
import * as AssignmentService from '../services/tables/assignments';
import * as AssignmentGpuService from '../services/tables/assignmentGpus';
import * as DiffusorService from '../services/tables/diffusors';
import * as GpuService from '../services/tables/gpus';
import * as ComputerService from '../services/tables/computers';
import * as EdgeServerService from '../services/edge';

export const getAllAssignments = async (_req: Request, res: Response) => {
  const Assignments = await AssignmentService.getAllAssignments();
  res.json(Assignments);
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
      AssignmentGpuService.createAssignmentGPU(assignmentId, gpuId)
    )
  );
  res.json({ assignmentId });
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  await AssignmentService.deleteAssignment(Number(id));
  await AssignmentGpuService.deleteAssignmentGPUsByAssignmentId(Number(id));
  res.sendStatus(204);
};

export const updateAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, modelName, port, gpuIds } = req.body;
  const [affectedARows, currentAssignmentGpus] = await Promise.all([
    AssignmentService.updateAssignment(Number(id), name, modelName, port),
    AssignmentGpuService.getAssignmentGPUsByAssignmentId(Number(id)),
  ]);
  await Promise.all(
    (gpuIds as number[])
      .map((gpuId) => {
        if (!currentAssignmentGpus.find((ag) => ag.gpuId === gpuId)) {
          return AssignmentGpuService.createAssignmentGPU(Number(id), gpuId);
        }
      })
      .filter(Boolean).concat(
  currentAssignmentGpus.map((ag) => {
    if (!(gpuIds as number[]).find((gpuId) => ag.gpuId === gpuId)) {
      return AssignmentGpuService.deleteAssignmentGpu(Number(id), ag.gpuId);
    }
  }).filter(Boolean);
);
  res.json({ affectedARows });
};

export const deployAssignments = async (req: Request, res: Response) => {
  const [computers, gpus, diffusors, assignments] = await Promise.all([
    ComputerService.getAllComputers(),
    GpuService.getAllGPUs(),
    DiffusorService.getAllDiffusors(),
    AssignmentService.getAllAssignments(),
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
            gpuIds: assignment.gpuIds,
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
