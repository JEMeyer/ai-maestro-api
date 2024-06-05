export interface Computer {
  id: string;
  name: string;
  ipAddr: string;
}

export interface GPU {
  id: string;
  name: string;
  vramSize: number;
  computerId: string;
  weight?: number;
}

export interface Model {
  name: string;
  size: number;
  type?: 'stt' | 'tts'; // Only for speech models
}

export interface Assignment {
  id: string;
  name: string;
  modelName: string;
  gpuIds: string[];
  port: number;
}

export interface AssignmentGPU {
  assignmentId: number;
  gpuId: number;
}
