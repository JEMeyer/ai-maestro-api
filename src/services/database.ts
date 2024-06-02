import fs from 'fs/promises';
import { generateUUID } from '../utilities/uuid';

const filePath = './config.json';

export interface Computer {
  id: string;
  name: string;
  ipAddr: string;
}

export interface GPU {
  id: string;
  name: string;
  vramSize: number;
  computerId: string;
}

export interface Model {
  id: string;
  name: string;
  containerName: string;
  size: number;
  port: number;
  gpuIds: string[] | null;
}

export interface Configuration {
  computers: Computer[];
  gpus: GPU[];
  models: Model[];
}

async function readConfigFile(): Promise<Configuration> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as any).code === 'ENOENT'
    ) {
      return { computers: [], gpus: [], models: [] };
    }
    throw err;
  }
}

async function writeConfigFile(data: Configuration) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to config file:', err);
    throw err;
  }
}

export async function getConfiguration(): Promise<Configuration> {
  return await readConfigFile();
}

// Computers
export const createComputer = async (name: string, ipAddr: string) => {
  const id = generateUUID();
  const config = await readConfigFile();
  const newComputer = { id, name, ipAddr };
  config.computers.push(newComputer);
  await writeConfigFile(config);
  return id;
};

export const deleteComputer = async (id: string) => {
  const config = await readConfigFile();
  config.computers = config.computers.filter((computer) => computer.id !== id);
  await writeConfigFile(config);
};

// GPUs
export const createGPU = async (
  name: string,
  vramSize: number,
  computerId: string
) => {
  const id = generateUUID();
  const config = await readConfigFile();
  const newGPU = { id, name, vramSize, computerId };
  config.gpus.push(newGPU);
  await writeConfigFile(config);
  return id;
};

export const deleteGPU = async (id: string) => {
  const config = await readConfigFile();
  config.gpus = config.gpus.filter((gpu) => gpu.id !== id);
  await writeConfigFile(config);
};

// Models
export const createModel = async (
  name: string,
  containerName: string,
  size: number,
  port: number
) => {
  const id = generateUUID();
  const config = await readConfigFile();
  const newModel = { id, name, containerName, size, port, gpuIds: [] };
  config.models.push(newModel);
  await writeConfigFile(config);
  return id;
};

export const deleteModel = async (id: string) => {
  const config = await readConfigFile();
  config.models = config.models.filter((model) => model.id !== id);
  await writeConfigFile(config);
};

// Model-GPU Assignments
export const createAssignment = async (modelId: string, gpuId: string) => {
  const config = await readConfigFile();
  const model = config.models.find((model) => model.id === modelId);
  if (model) {
    model.gpuIds = model.gpuIds || [];
    model.gpuIds.push(gpuId);
    await writeConfigFile(config);
  }
};

export const deleteAssignment = async (modelId: string, gpuId: string) => {
  const config = await readConfigFile();
  const model = config.models.find((model) => model.id === modelId);
  if (model && model.gpuIds) {
    model.gpuIds = model.gpuIds.filter((id) => id !== gpuId);
    await writeConfigFile(config);
  }
};
