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
  return Number(result.insertId); // Should always be 0 due to joint key
};

// Read all Assignment-GPU mappings
export const getAllAssignmentGPUs = async (): Promise<AssignmentGPU[]> => {
  const query = 'SELECT * FROM assignment_gpus';
  const [rows] = await pool.query(query);
  let rowsArray;

  // Handle the case when the table is empty or has a single row
  if (rows === undefined) {
    rowsArray = [];
  } else if (Array.isArray(rows)) {
    rowsArray = rows;
  } else {
    rowsArray = [rows];
  }

  return rowsArray;
};

// Read Assignment-GPU mappings by assignment id
export const getAssignmentGPUsByAssignmentId = async (
  assignmentId: number
): Promise<AssignmentGPU[]> => {
  const query = 'SELECT * FROM assignment_gpus WHERE assignment_id = ?';
  const [rows] = await pool.query(query, [assignmentId]);
  let rowsArray;

  // Handle the case when the table is empty or has a single row
  if (rows === undefined) {
    rowsArray = [];
  } else if (Array.isArray(rows)) {
    rowsArray = rows;
  } else {
    rowsArray = [rows];
  }

  return rowsArray;
};

// Delete Assignment-GPU mappings by assignment id
export const deleteAssignmentGPUsByAssignmentId = async (
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
