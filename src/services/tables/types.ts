export interface Computer {
  id: number;
  name: string;
  ipAddr: string;
  displayOrder: number;
}

export interface GPU {
  id: number;
  name: string;
  vramSize: number;
  computerId: number;
  weight?: number;
  displayOrder: number;
}

export interface Model {
  name: string;
  size: number;
  model_type?: 'stt' | 'tts'; // Only for speech models
  displayOrder: number;
}

export interface DBAssignment {
  id: number;
  name: string;
  modelName: string;
  port: number;
  displayOrder: number;
}

export interface DBAssignmentGPU {
  assignmentId: number;
  gpuId: number;
}

export interface Assignment {
  id: number;
  name: string;
  modelName: string;
  gpuIds: number[];
  port: number;
  displayOrder: number;
}
