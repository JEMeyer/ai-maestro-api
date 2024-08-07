interface MakeContainerProps {
  containerName: string;
  port: string;
  gpu_ids: number[];
  diffusionModel?: string; // 'sdxl-turbo' or 'sd-turbo'
}

interface LoadModelProps {
  modelName: string;
  containerName: string;
  mode?: string; // Mode is 'diffusion' vs anything else
}

export const makeContainer = async (
  ipAddr: string,
  props: MakeContainerProps
): Promise<Response> => {
  const response = await fetch(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/up-container`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    }
  );
  return response;
};

// Mode is 'diffusion' vs anything else
export const removeContainer = async (
  ipAddr: string,
  props: { containerName: string; mode: string }
): Promise<Response> => {
  const response = await fetch(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/down-container`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    }
  );
  return response;
};

export const removeAllContainers = async (
  ipAddr: string
): Promise<Response> => {
  const response = await fetch(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/down-all-containers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
};

export const loadModel = async (
  ipAddr: string,
  props: LoadModelProps
): Promise<Response> => {
  const response = await fetch(
    `${ipAddr}:${process.env.EDGE_SERVER_PORT}/load-model`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props),
    }
  );
  return response;
};

export const getCurrentDockerContainers = async (ipAddr: string) => {
  try {
    const response = await fetch(
      `${ipAddr}:${process.env.EDGE_SERVER_PORT}/get-current-containers`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error getting current docker containers');
    throw error;
  }
};
