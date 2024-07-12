import { pool } from '../db';
import { DBAssignmentGPU } from './types';

// Create a new Assignment-GPU mapping
export const createDBAssignmentGPU = async (
  assignmentId: number,
  gpuId: number
): Promise<number> => {
  const query =
    'INSERT INTO assignment_gpus (assignment_id, gpu_id) VALUES (?, ?)';
  const result = await pool.query(query, [assignmentId, gpuId]);
  return Number(result.insertId); // Should always be 0 due to joint key
};

// Read all Assignment-GPU mappings
export const getAllDBAssignmentGPUs = async (): Promise<DBAssignmentGPU[]> => {
  const query = 'SELECT * FROM assignment_gpus';
  return await pool.query(query);
};

// Read Assignment-GPU mappings by assignment id
export const getDBAssignmentGPUsByAssignmentId = async (
  assignmentId: number
): Promise<DBAssignmentGPU[]> => {
  const query = 'SELECT * FROM assignment_gpus WHERE assignment_id = ?';
  return await pool.query(query, [assignmentId]);
};

// Delete Assignment-GPU mappings by assignment id
export const deleteDBAssignmentGPUsByAssignmentId = async (
  assignmentId: number
): Promise<number> => {
  const query = 'DELETE FROM assignment_gpus WHERE assignment_id = ?';
  const result = await pool.query(query, [assignmentId]);
  return Number(result.affectedRows);
};

// Delete an Assignment-GPU mapping
export const deleteAssignmentGpu = async (
  gpuId: number,
  assignmentId: number
): Promise<number> => {
  const query =
    'DELETE FROM assignment_gpus WHERE gpu_id = ? AND assignment_id = ?';
  const result = await pool.query(query, [gpuId, assignmentId]);
  return Number(result.affectedRows);
};
