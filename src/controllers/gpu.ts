import { Request, Response } from 'express';
import * as GpuService from '../services/tables/gpus';
import { redisClient } from '../services/redis';

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
  const { name, vramSize, computerId, weight, display_order } = req.body;
  const id = await GpuService.createGPU(
    name,
    vramSize,
    computerId,
    display_order,
    weight
  );
  res.json({ id });
};

export const deleteGPU = async (req: Request, res: Response) => {
  const { id } = req.params;
  await GpuService.deleteGPU(Number(id));
  res.sendStatus(204);
};

export const updateGPU = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, vramSize, computerId, weight, display_order } = req.body;
  await GpuService.updateGPU(
    Number(id),
    name,
    vramSize,
    computerId,
    display_order,
    weight
  );
  res.sendStatus(204);
};

export const getGpuLockStatuses = async (_req: Request, res: Response) => {
  try {
    const keys = await redisClient.keys('gpu-lock:*');
    const statuses = await Promise.all(keys.map((key) => redisClient.get(key)));
    const statusMap = keys.reduce(
      (acc, key, index) => {
        acc[key] = statuses[index];
        return acc;
      },
      {} as { [key: string]: string | null }
    );

    res.json(statusMap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GPU statuses' });
  }
};
