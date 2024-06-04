import { readFile, writeFile } from 'fs/promises';
import {
  getCurrentConfig,
  getGPUFromPath,
  getPathFromAssignment,
} from '../services/database';
import { Compute } from './computeStatus';

const defaultDirPath = '/app/data';
const dataDir = process.env.DATA_DIR ? process.env.DATA_DIR.trim() : '';
const dirPath = dataDir !== '' ? dataDir : defaultDirPath;
const filePath = `${dirPath}/model_map.json`;

// In-memory storage for the model-to-server mapping. With a model name as the key returns an array of paths (ip + port).
let MODEL_TO_PATH_MAP: Record<string, string[] | undefined> = {};

export const updateModelToServerMapping = async () => {
  try {
    const config = getCurrentConfig();

    // Build up a new record
    const pathMap: Record<string, string[]> = {};

    // Loop through each assignment in the fetched configuration
    for (const assignment of config.assignments) {
      console.log(assignment);
      const path = getPathFromAssignment(assignment);
      console.log(path);

      // Initialize the array if it doesn't exist yet
      if (!pathMap[assignment.modelName]) pathMap[assignment.modelName] = [];

      // Add the created full path to the array associated with the model name in the MODEL_TO_PATH_MAP object
      pathMap[assignment.modelName].push(path);

      console.log(pathMap);
    }

    // Sort in descending order. Higher priority comes first
    for (const modelName in pathMap) {
      pathMap[modelName].sort((a, b) => {
        const priorityA = getGPUFromPath(a)?.weight ?? 1;
        const priorityB = getGPUFromPath(b)?.weight ?? 1;

        return priorityB - priorityA;
      });
    }

    MODEL_TO_PATH_MAP = pathMap;
    try {
      await writeFile(filePath, JSON.stringify(MODEL_TO_PATH_MAP));
      console.log('Wrote updated model-to-server mapping to file');
    } catch (error) {
      console.error('Error writing model-to-server mapping to file:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error fetching model-to-server mapping:', error);
    throw error;
  }
};

export const loadModelMapFromFile = async () => {
  try {
    const data = await readFile(filePath, 'utf8');
    const map = JSON.parse(data);
    MODEL_TO_PATH_MAP = map;
  } catch (err) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as any).code === 'ENOENT'
    ) {
      return;
    }
    throw err;
  }
};

/**
 * This function reserves a GPU for a given model by checking the availability of its associated servers.
 * If it finds a server that is not busy, it marks the server as busy and returns the server address.
 * If no free server is found, it returns undefined.
 * @param {string} modelName - The name of the model for which to reserve a GPU.
 * @returns {string | undefined} - The address of the reserved server if available; otherwise, undefined.
 */
export const reserveGPU = (modelName: string) => {
  console.log(MODEL_TO_PATH_MAP);
  console.log(modelName);
  // Get model gpuIds we can use
  const paths = MODEL_TO_PATH_MAP[modelName] ?? [];

  console.log(paths);

  // Loop and find the first one that is free, otherwise return undefined
  for (const path of paths) {
    const isBusy = Compute.isBusy(path);

    if (isBusy instanceof Error) return isBusy;

    if (!isBusy) {
      if (Compute.markBusy(path) instanceof Error)
        return Error('Failed to mark server as busy');
      return path;
    }
  }
  return undefined;
};
