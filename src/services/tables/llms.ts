import { pool } from '../db';
import { Model } from './types';

// Create a new LLM
export const createLLM = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'INSERT INTO llms (name, size) VALUES (?, ?)';
  const result = await pool.query(query, [name, size]);
  return Number(result.insertId);
};

// Read all LLMs
export const getAllLLMs = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM llms';
  let llms = await pool.query(query);
  llms = llms.map((model: Model) => ({
    ...model,
    model_type: 'llm',
  }));

  return llms;
};

// Read an LLM by name
export const getLLMByName = async (name: string): Promise<Model | null> => {
  const query = 'SELECT * FROM llms WHERE name = ? LIMIT 1';
  let rows = await pool.query(query, [name]);
  rows = rows.map((model: Model) => ({
    ...model,
    model_type: 'llm',
  }));

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
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
