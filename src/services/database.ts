import { readFile, writeFile } from 'fs/promises';
import { generateUUID } from '../utilities/uuid';

const defaultDirPath = '/app/data';
const dataDir = process.env.DATA_DIR ? process.env.DATA_DIR.trim() : '';
const dirPath = dataDir !== '' ? dataDir : defaultDirPath;
const filePath = `${dirPath}/config.json`;

interface Computer {
  id: string;
  name: string;
  ipAddr: string;
}

interface GPU {
  id: string;
  name: string;
  vramSize: number;
  computerId: string;
  weight?: number;
}

interface Model {
  name: string;
  size: number;
}

interface Assignment {
  id: string;
  name: string;
  modelName: string;
  gpuIds: string[];
  port: number;
}

interface Configuration {
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

export const extractIpAddressAndPort = (
  url: string
): [string, number] | null => {
  const regex = /http:\/\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+):(\d+)/;
  const match = url.match(regex);
  if (match && match[1] && match[2]) {
    return [match[1], parseInt(match[2], 10)];
  }
  return null;
};

export const getPathFromAssignment = (assignment: Assignment) => {
  const config = getCurrentConfig();
  // Find the computer this model is going to. Taking 1st GPU id is fine since it always has >= 1.
  // Even multi-gpu setups still go to the same computer so others aren't relevant here.
  const gpu = config.gpus.find((g) => g.id === assignment.gpuIds[0]);
  const computer = config.computers.find((c) => c.id === gpu?.computerId);

  // Create a full path string - must be enough for the router in main.ts to recognize it as a route.
  return `http://${computer?.ipAddr}:${assignment.port}`;
};

export const getGPUFromPath = (path: string) => {
  const config = getCurrentConfig();
  const ipAndPort = extractIpAddressAndPort(path) ?? ['', 0];

  // First, find the computer with the given IP addres, then find a gpu with that computer's id
  const computer = config.computers.find((c) => c.ipAddr === ipAndPort[0]);
  const gpu = config.gpus.find((g) => g.computerId === computer?.id);

  return gpu;
};

export const getCurrentConfig = () => {
  return Object.freeze({ ...CURRENT_CONFIGURATION });
};

export const loadConfigFile = async (): Promise<Configuration> => {
  try {
    const data = await readFile(filePath, 'utf8');
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
    await writeFile(
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
  computerId: string,
  weight?: number
) => {
  const id = generateUUID();
  const newGPU = { id, name, vramSize, computerId, weight: weight };
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
