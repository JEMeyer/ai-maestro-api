import axios, { AxiosResponse } from 'axios';

interface MakeContainerProps {
  containerName: string;
  port: string;
  gpuIds: string[];
}

interface LoadModelProps {
  modelName: string;
  containerName: string;
}

export const makeContainer = async (
  path: string,
  props: MakeContainerProps
): Promise<AxiosResponse> => {
  const { containerName, port, gpuIds } = props;
  return axios.post(`${path}/up-container`, {
    containerName,
    port,
    gpuIds,
  });
};

export const removeContainer = async (
  path: string,
  props: MakeContainerProps
): Promise<AxiosResponse> => {
  const { containerName, port, gpuIds } = props;
  return axios.post(`${path}/down-container`, {
    containerName,
    port,
    gpuIds,
  });
};

export const loadModel = async (
  path: string,
  props: LoadModelProps
): Promise<AxiosResponse> => {
  const { modelName, containerName } = props;
  return axios.post(`${path}/load-model`, { modelName, containerName });
};
