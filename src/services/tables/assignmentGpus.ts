import { pool } from '../db';
import { AssignmentGPU } from './types';

// Create a new Assignment-GPU mapping
export const createAssignmentGPU = async (
  assignmentId: number,
  gpuId: number
): Promise<number> => {
  const query =
    'INSERT INTO assignment_gpus (assignment_id, gpu_id) VALUES (?, ?)';
  const result = await pool.query(query, [assignmentId, gpuId]);
  return Number(result.affectedRows);
};

// Read all Assignment-GPU mappings
export const getAllAssignmentGPUs = async (): Promise<AssignmentGPU[]> => {
  const query = 'SELECT * FROM assignment_gpus';
  const [rows] = await pool.query(query);
  return rows;
};

// Read Assignment-GPU mappings by assignment id
export const getAssignmentGPUsByAssignmentId = async (
  assignmentId: number
): Promise<AssignmentGPU | null> => {
  const query = 'SELECT * FROM assignment_gpus WHERE assignment_id = ?';
  const [rows] = await pool.query(query, [assignmentId]);
  return rows;
};

// Delete an Assignment-GPU mapping
export const deleteAssignmentGPU = async (
  assignmentId: number,
  gpuId: number
): Promise<number> => {
  const query =
    'DELETE FROM assignment_gpus WHERE assignment_id = ? AND gpu_id = ?';
  const result = await pool.query(query, [assignmentId, gpuId]);
  return Number(result.affectedRows);
};
