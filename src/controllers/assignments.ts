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
    const assignmentGpusForAssignment = assignmentGpus.filter(
      ({ assignment_id }) => assignment_id === assignment.id
    );
    const gpu_ids = assignmentGpusForAssignment.map(({ gpu_id }) => gpu_id);
    return {
      ...assignment,
      gpu_ids: gpu_ids,
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
  const { name, modelName, port, gpu_ids, display_order } = req.body as {
    name: string;
    modelName: string;
    port: number;
    gpu_ids: number[];
    display_order: number;
  };
  const assignmentId = await AssignmentService.createAssignment(
    name,
    modelName,
    port,
    display_order
  );
  await Promise.all(
    gpu_ids.map((gpuId) =>
      AssignmentGpuService.createDBAssignmentGPU(assignmentId, gpuId)
    )
  );
  res.json({ id: assignmentId });
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
  const { name, model_name, port, gpu_ids, display_order } = req.body as {
    name: string;
    model_name: string;
    port: number;
    gpu_ids: number[];
    display_order: number;
  };
  const idAsNumber = Number(id);

  // First update the assignment record, and pull all current assignmentGpus
  const [affectedARows, currentAssignmentGpus] = await Promise.all([
    AssignmentService.updateAssignment(
      idAsNumber,
      name,
      model_name,
      port,
      display_order
    ),
    AssignmentGpuService.getDBAssignmentGPUsByAssignmentId(idAsNumber),
  ]);

  // Now look to see which assignment gpus we need to delete/create
  await Promise.all(
    gpu_ids
      .map((gpuId) => {
        if (!currentAssignmentGpus.find((ag) => ag.gpu_id === gpuId)) {
          return AssignmentGpuService.createDBAssignmentGPU(idAsNumber, gpuId);
        }
      })
      .concat(
        currentAssignmentGpus
          .map((ag) => {
            if (!gpu_ids.find((gpuId) => ag.gpu_id === gpuId)) {
              return AssignmentGpuService.deleteAssignmentGpu(
                idAsNumber,
                ag.gpu_id
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
    await EdgeServerService.removeAllContainers(computer.ip_addr);
  });

  // Loop through each model, start the containers, load the model in each container
  const makeAndLoadContainerPromises: Promise<void>[] = [];
  assignments.forEach((assignment) => {
    const ipAddr = computers.find(({ id }) => {
      return id === gpus[0].computer_id;
    })?.ip_addr;
    const isDiffusionModel = diffusors.some(
      ({ name }) => name === assignment.model_name
    );
    if (ipAddr != null) {
      makeAndLoadContainerPromises.push(
        (async () => {
          await EdgeServerService.makeContainer(ipAddr, {
            containerName: assignment.name,
            port: String(assignment.port),
            gpu_ids: assignmentGpus
              .filter(({ assignment_id }) => assignment.id === assignment_id)
              .map(({ gpu_id }) => gpu_id),
            diffusionModel: isDiffusionModel
              ? assignment.model_name
              : undefined,
          });

          await EdgeServerService.loadModel(ipAddr, {
            containerName: assignment.name,
            modelName: assignment.model_name,
            mode: isDiffusionModel ? 'diffusion' : undefined,
          });
        })()
      );
    }
  });
  await Promise.all(makeAndLoadContainerPromises);

  res.sendStatus(200);
};
