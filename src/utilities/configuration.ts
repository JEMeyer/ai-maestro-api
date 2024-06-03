import {
  Assignment,
  Configuration,
  getCurrentConfig,
} from '../services/database';
import { serverStatus } from './serverStatus';

const getPathFromAssignment = (
  assignment: Assignment,
  config: Configuration
) => {
  // Find the computer this model is going to. Taking 1st GPU id is fine since it always has >= 1.
  // Even multi-gpu setups still go to the same computer so others aren't relevant here.
  const gpu = config.gpus.find((g) => g.id === assignment.gpuIds[0]);
  const computer = config.computers.find((c) => c.id === gpu?.computerId);

  // Create a full path string - must be enough for the router in main.ts to recognize it as a route.
  return `http://${computer?.ipAddr}:${assignment.port}`;
};

// In-memory storage for the model-to-server mapping. With a model name as the key returns an array of paths (ip + port).
const modelToPathMap: Record<string, string[]> = {};

export const updateModelToServerMapping = async () => {
  try {
    const config = getCurrentConfig();

    // Loop through each assignment in the fetched configuration
    for (const assignment of config.assignments) {
      const path = getPathFromAssignment(assignment, config);

      // Initialize the array if it doesn't exist yet
      if (!modelToPathMap[assignment.modelName])
        modelToPathMap[assignment.modelName] = [];

      // Add the created full path to the array associated with the model name in the modelToPathMap object
      modelToPathMap[assignment.modelName].push(path);
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
export const reserveGPU = (modelName: string): string | undefined => {
  // Get model gpuIds we can use
  const paths = modelToPathMap[modelName];

  // Loop and find the first one that is free, otherwise return undefined
  for (const path of paths) {
    if (!serverStatus.isBusy(path)) {
      serverStatus.markBusy(path);
      return path;
    }
  }
  return undefined;
};
