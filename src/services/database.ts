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
  name: string;
  size: number;
}

export interface Assignment {
  id: string;
  name: string;
  modelName: string;
  gpuIds: string[];
  port: number;
}

export interface Configuration {
  computers: Computer[];
  gpus: GPU[];
  llms: Model[];
  diffusors: Model[];
  assignments: Assignment[];
}

let CURRENT_CONFIGURATION: Configuration = {
  computers: [],
  gpus: [],
  llms: [],
  diffusors: [],
  assignments: [],
};

export const getCurrentConfig = () => {
  return Object.freeze({ ...CURRENT_CONFIGURATION });
};

export const readConfigFile = async (): Promise<Configuration> => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const config = JSON.parse(data);
    CURRENT_CONFIGURATION = config;
    return config;
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as any).code === 'ENOENT'
    ) {
      return {
        computers: [],
        gpus: [],
        llms: [],
        diffusors: [],
        assignments: [],
      };
    }
    throw err;
  }
};

async function writeConfigFile() {
  try {
    await fs.writeFile(
      filePath,
      JSON.stringify(CURRENT_CONFIGURATION, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('Error writing to config file:', err);
    throw err;
  }
}

// Computers
export const createComputer = async (name: string, ipAddr: string) => {
  const id = generateUUID();
  const newComputer = { id, name, ipAddr };
  CURRENT_CONFIGURATION.computers.push(newComputer);
  await writeConfigFile();
  return id;
};

export const deleteComputer = async (id: string) => {
  CURRENT_CONFIGURATION.computers = CURRENT_CONFIGURATION.computers.filter(
    (computer) => computer.id !== id
  );
  await writeConfigFile();
};

// GPUs
export const createGPU = async (
  name: string,
  vramSize: number,
  computerId: string
) => {
  const id = generateUUID();
  const newGPU = { id, name, vramSize, computerId };
  CURRENT_CONFIGURATION.gpus.push(newGPU);
  await writeConfigFile();
  return id;
};

export const deleteGPU = async (id: string) => {
  CURRENT_CONFIGURATION.gpus = CURRENT_CONFIGURATION.gpus.filter(
    (gpu) => gpu.id !== id
  );
  await writeConfigFile();
};

// Models
export const createModel = async (
  name: string,
  size: number,
  type: 'llm' | 'diffusor'
) => {
  const newModel = { name, size };

  if (type === 'llm') CURRENT_CONFIGURATION.llms.push(newModel);
  else if (type === 'diffusor') CURRENT_CONFIGURATION.diffusors.push(newModel);

  await writeConfigFile();
};

export const deleteModel = async (name: string) => {
  // Deletes from both so I don't need to pass in the type
  CURRENT_CONFIGURATION.llms = CURRENT_CONFIGURATION.llms.filter(
    (model) => model.name !== name
  );
  CURRENT_CONFIGURATION.diffusors = CURRENT_CONFIGURATION.diffusors.filter(
    (model) => model.name !== name
  );

  await writeConfigFile();
};

let PORT = 4000;
export const RESERVED_PORTS = new Set();
const getNextPort = (): number => {
  const newPort = PORT++;
  if (RESERVED_PORTS.has(newPort)) {
    return getNextPort();
  } else {
    return newPort;
  }
};

// Model-GPU Assignments
export const createAssignment = async (
  modelName: string,
  gpuIds: string[],
  name: string
) => {
  const newAssignment = {
    id: generateUUID(),
    name,
    modelName,
    gpuIds,
    port: getNextPort(),
  };

  CURRENT_CONFIGURATION.assignments.push(newAssignment);

  await writeConfigFile();
};

export const deleteAssignment = async (id: string) => {
  CURRENT_CONFIGURATION.assignments = CURRENT_CONFIGURATION.assignments.filter(
    (assignment) => assignment.id !== id
  );
  await writeConfigFile();
};
