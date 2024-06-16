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
  return Number(result.insertId);
};

// Read all Assignments
export const getAllAssignments = async (): Promise<Assignment[]> => {
  const query = 'SELECT * FROM assignments';
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

// Read an Assignment by id
export const getAssignmentById = async (
  id: number
): Promise<Assignment | null> => {
  const query = 'SELECT * FROM assignments WHERE id = ?';
  const [rows] = await pool.query(query, [id]);

  // Handle the case when the table is empty or has a single row
  const row = rows.length > 0 ? rows[0] : null;

  return row;
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
  return Number(result.affectedRows);
};

// Delete an Assignment
export const deleteAssignment = async (id: number): Promise<number> => {
  const query = 'DELETE FROM assignments WHERE id = ?';
  const result = await pool.query(query, [id]);
  return Number(result.affectedRows);
};
