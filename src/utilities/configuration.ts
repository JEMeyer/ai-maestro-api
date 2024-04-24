import { getConfiguration } from '../services/database';
import { serverStatus } from './serverStatus';

// In-memory storage for the model-to-server mapping
let modelToServerMap: Record<string, string[]> = {};

export const updateModelToServerMapping = async () => {
  try {
    const { models, gpus, computers } = await getConfiguration();
    const result: Record<string, string[]> = {};

    for (const model of models) {
      const gpuIds = model.gpuIds || [];
      const serverAddresses = gpuIds
        .map((gpuId) => {
          const gpu = gpus.find((g) => g.id === gpuId);
          const computer = computers.find((c) => c.id === gpu?.computerId);
          return `http://${computer?.ipAddr}:${model.port}`;
        })
        .filter(Boolean);

      result[model.name] = serverAddresses;
    }

    modelToServerMap = result;
  } catch (error) {
    console.error('Error fetching model-to-server mapping:', error);
    throw error;
  }
};

export const reserveServer = (modelName: string) => {
  // Get model gpuIds we can use
  const servers = modelToServerMap[modelName];

  // Loop and find the first one that is free, otherwise return undefined
  for (const server of servers) {
    if (!serverStatus.isServerBusy(server)) {
      serverStatus.markServerBusy(server);
      return server;
    }
  }
  return undefined;
};
