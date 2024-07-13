import { pool } from '../db';
import { Model } from './types';

// Create a new Diffusor
export const createDiffusor = async (
  name: string,
  size: number,
  display_order: number
): Promise<number> => {
  const query =
    'INSERT INTO diffusors (name, size, display_order) VALUES (?, ?, ?)';
  const result = await pool.query(query, [name, size, display_order]);
  return Number(result.insertId);
};

// Read all Diffusors
export const getAllDiffusors = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM diffusors ORDER BY display_order ASC';
  let diffusors = await pool.query(query);
  diffusors = diffusors.map((model: Model) => ({
    ...model,
    model_type: 'diffusor',
  }));

  return diffusors;
};

// Read a Diffusor by name
export const getDiffusorByName = async (
  name: string
): Promise<Model | null> => {
  const query = 'SELECT * FROM diffusors WHERE name = ? LIMIT 1';
  let rows = await pool.query(query, [name]);
  rows = rows.map((model: Model) => ({
    ...model,
    model_type: 'diffusor',
  }));

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update a Diffusor
export const updateDiffusor = async (
  name: string,
  size: number,
  display_order: number
): Promise<number> => {
  const query =
    'UPDATE diffusors SET size = ?, display_order = ? WHERE name = ?';
  const result = await pool.query(query, [size, display_order, name]);
  return Number(result.affectedRows);
};

// Delete a Diffusor
export const deleteDiffusor = async (name: string): Promise<number> => {
  const query = 'DELETE FROM diffusors WHERE name = ?';
  const result = await pool.query(query, [name]);
  return Number(result.affectedRows);
};
