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
  ipAddr: string,
  props: MakeContainerProps
): Promise<AxiosResponse> => {
  const { containerName, port, gpuIds } = props;
  return axios.post(`${ipAddr}:${process.env.CHILD_SERVER_PORT}/up-container`, {
    containerName,
    port,
    gpuIds,
  });
};

export const removeContainer = async (
  ipAddr: string,
  props: { containerName: string }
): Promise<AxiosResponse> => {
  const { containerName } = props;
  return axios.post(
    `${ipAddr}:${process.env.CHILD_SERVER_PORT}/down-container`,
    {
      containerName,
    }
  );
};

export const removeAllContainers = async (
  ipAddr: string
): Promise<AxiosResponse> => {
  return axios.post(
    `${ipAddr}:${process.env.CHILD_SERVER_PORT}/down-all-containers`
  );
};

export const loadModel = async (
  ipAddr: string,
  props: LoadModelProps
): Promise<AxiosResponse> => {
  const { modelName, containerName } = props;
  return axios.post(`${ipAddr}:${process.env.CHILD_SERVER_PORT}/load-model`, {
    modelName,
    containerName,
  });
};
