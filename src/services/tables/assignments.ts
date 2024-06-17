import { pool } from '../db';
import { Assignment } from './types';

// Create a new Assignment
export const createAssignment = async (
  name: string,
  modelName: string,
  port: number
): Promise<number> => {
  const query =
    'INSERT INTO assignments (name, model_name, port) VALUES (?, ?, ?)';
  const result = await pool.query(query, [name, modelName, port]);
  console.log(result);
  return Number(result.insertId);
};

// Read all Assignments
export const getAllAssignments = async (): Promise<Assignment[]> => {
  const query = 'SELECT * FROM assignments';
  return await pool.query(query);
};

// Read an Assignment by id
export const getAssignmentById = async (
  id: number
): Promise<Assignment | null> => {
  const query = 'SELECT * FROM assignments WHERE id = ? LIMIT 1';
  const rows = await pool.query(query, [id]);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update an Assignment
export const updateAssignment = async (
  id: number,
  name: string,
  modelName: string,
  port: number
): Promise<number> => {
  const query =
    'UPDATE assignments SET name = ?, model_name = ?, port = ? WHERE id = ?';
  const result = await pool.query(query, [name, modelName, port, id]);
  console.log(result);
  return Number(result.affectedRows);
};

// Delete an Assignment
export const deleteAssignment = async (id: number): Promise<number> => {
  const query = 'DELETE FROM assignments WHERE id = ?';
  const result = await pool.query(query, [id]);
  console.log(result);
  return Number(result.affectedRows);
};
