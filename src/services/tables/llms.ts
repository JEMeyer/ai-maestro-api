import { pool } from '../db';
import { Model } from './types';

// Create a new LLM
export const createLLM = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'INSERT INTO llms (name, size) VALUES (?, ?)';
  const result = await pool.query(query, [name, size]);
  return Number(result.affectedRows);
};

// Read all LLMs
export const getAllLLMs = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM llms';
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

// Read an LLM by name
export const getLLMByName = async (name: string): Promise<Model | null> => {
  const query = 'SELECT * FROM llms WHERE name = ?';
  const [rows] = await pool.query(query, [name]);

  // Handle the case when the table is empty or has a single row
  const row = rows.length > 0 ? rows[0] : null;

  return row;
};

// Update an LLM
export const updateLLM = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'UPDATE llms SET size = ? WHERE name = ?';
  const result = await pool.query(query, [size, name]);
  return Number(result.affectedRows);
};

// Delete an LLM
export const deleteLLM = async (name: string): Promise<number> => {
  const query = 'DELETE FROM llms WHERE name = ?';
  const result = await pool.query(query, [name]);
  return Number(result.affectedRows);
};
