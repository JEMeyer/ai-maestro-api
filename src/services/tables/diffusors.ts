import { pool } from '../db';
import { Model } from './types';

// Create a new Diffusor
export const createDiffusor = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'INSERT INTO diffusors (name, size) VALUES (?, ?)';
  const result = await pool.query(query, [name, size]);
  return Number(result.insertId);
};

// Read all Diffusors
export const getAllDiffusors = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM diffusors';
  return await pool.query(query);
};

// Read a Diffusor by name
export const getDiffusorByName = async (
  name: string
): Promise<Model | null> => {
  const query = 'SELECT * FROM diffusors WHERE name = ? LIMIT 1';
  const rows = await pool.query(query, [name]);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update a Diffusor
export const updateDiffusor = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'UPDATE diffusors SET size = ? WHERE name = ?';
  const result = await pool.query(query, [size, name]);
  return Number(result.affectedRows);
};

// Delete a Diffusor
export const deleteDiffusor = async (name: string): Promise<number> => {
  const query = 'DELETE FROM diffusors WHERE name = ?';
  const result = await pool.query(query, [name]);
  return Number(result.affectedRows);
};
