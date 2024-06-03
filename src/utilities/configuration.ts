import {
  getCurrentConfig,
  getGPUFromPath,
  getPathFromAssignment,
} from '../services/database';
import { Compute } from './computeStatus';

// In-memory storage for the model-to-server mapping. With a model name as the key returns an array of paths (ip + port).
let MODEL_TO_PATH_MAP: Record<string, string[]> = {};

export const updateModelToServerMapping = async () => {
  try {
    const config = getCurrentConfig();

    // Build up a new record
    const pathMap: Record<string, string[]> = {};

    // Loop through each assignment in the fetched configuration
    for (const assignment of config.assignments) {
      const path = getPathFromAssignment(assignment);

      // Initialize the array if it doesn't exist yet
      if (!pathMap[assignment.modelName]) pathMap[assignment.modelName] = [];

      // Add the created full path to the array associated with the model name in the MODEL_TO_PATH_MAP object
      pathMap[assignment.modelName].push(path);
    }

    // Sort in descending order. Higher priority comes first
    for (const modelName in pathMap) {
      pathMap[modelName].sort((a, b) => {
        const priorityA = getGPUFromPath(a)?.weight ?? 1;
        const priorityB = getGPUFromPath(b)?.weight ?? 1;

        return priorityB - priorityA;
      });

      MODEL_TO_PATH_MAP = pathMap;
    }
  } catch (error) {
    console.error('Error fetching model-to-server mapping:', error);
    throw error;
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
  // Get model gpuIds we can use
  const paths = MODEL_TO_PATH_MAP[modelName];

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
