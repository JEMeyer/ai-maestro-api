import axios, { AxiosResponse } from 'axios';

interface MakeContainerProps {
  containerName: string;
  port: string;
  gpuIds: string[];
  diffusionModel?: string;
}

interface LoadModelProps {
  modelName: string;
  containerName: string;
  port?: number; // used for SD
}

export const makeContainer = async (
  ipAddr: string,
  props: MakeContainerProps
): Promise<AxiosResponse> => {
  return axios.post(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/up-container`,
    props
  );
};

export const removeContainer = async (
  ipAddr: string,
  props: { containerName: string; mode: string }
): Promise<AxiosResponse> => {
  return axios.post(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/down-container`,
    props
  );
};

export const removeAllContainers = async (
  ipAddr: string
): Promise<AxiosResponse> => {
  return axios.post(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/down-all-containers`
  );
};

export const loadModel = async (
  ipAddr: string,
  props: LoadModelProps
): Promise<AxiosResponse> => {
  return axios.post(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/load-model`,
    props
  );
};
