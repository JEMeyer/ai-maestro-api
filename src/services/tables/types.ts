export interface Computer {
  id: number;
  name: string;
  ip_addr: string;
  display_order: number;
}

export interface GPU {
  id: number;
  name: string;
  vram_size: number;
  computer_Id: number;
  weight?: number;
  display_order: number;
}

export interface Model {
  name: string;
  size: number;
  model_type?: 'stt' | 'tts'; // Only for speech models
  display_order: number;
}

export interface DBAssignment {
  id: number;
  name: string;
  model_name: string;
  port: number;
  display_order: number;
}

export interface DBAssignmentGPU {
  assignment_id: number;
  gpu_id: number;
}

export interface Assignment {
  id: number;
  name: string;
  model_name: string;
  gpu_ids: number[];
  port: number;
  display_order: number;
}
