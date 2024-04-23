import { getConfiguration } from '../services/database';

// In-memory storage for the model-to-server mapping
export let modelToServerMap: Record<string, string> = {};

export const updateModelToServerMapping = async () => {
  try {
    const modelToServersMap: Record<string, string[]> = {};
    const { models, gpus, computers } = await getConfiguration();
    const result: Record<string, string> = {};

    for (const model of models) {
      const gpuIds = model.gpuIds || [];
      const serverAddresses = gpuIds
        .map((gpuId) => {
          const gpu = gpus.find((g) => g.id === gpuId);
          const computer = computers.find((c) => c.id === gpu?.computerId);
          return `${computer?.ipAddr}:${model.port}`;
        })
        .filter(Boolean);

      modelToServersMap[model.name] = serverAddresses;
    }

    modelToServerMap = result;
  } catch (error) {
    console.error('Error fetching model-to-server mapping:', error);
    throw error;
  }
};
