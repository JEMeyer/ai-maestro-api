import { getConfiguration } from '../services/database';

export const fetchModelToServerMapping = async () => {
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

    return result;
  } catch (error) {
    console.error('Error fetching model-to-server mapping:', error);
    throw error;
  }
};
