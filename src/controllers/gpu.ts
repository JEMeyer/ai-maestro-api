import { Request, Response } from 'express';
import * as GpuService from '../services/tables/gpus';

export const getAllGpus = async (_req: Request, res: Response) => {
  const gpus = await GpuService.getAllGPUs();
  res.json(gpus);
};

export const getGpuById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const gpu = await GpuService.getGPUById(Number(id));
  if (gpu != null) res.json(gpu);
  else res.sendStatus(404);
};

export const createGPU = async (req: Request, res: Response) => {
  const { name, vramSize, computerId, weight } = req.body;
  const id = await GpuService.createGPU(name, vramSize, computerId, weight);
  res.json({ id });
};

export const deleteGPU = async (req: Request, res: Response) => {
  const { id } = req.params;
  await GpuService.deleteGPU(Number(id));
  res.sendStatus(204);
};
