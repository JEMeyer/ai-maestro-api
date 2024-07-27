import { pool } from '../db';

interface GPU {
  id: number;
  name: string;
  vram_size: number;
  computer_id: number;
  weight?: number;
}

// Create a new GPU
export const createGPU = async (
  name: string,
  vram_size: number,
  computer_id: number,
  display_order: number,
  weight?: number
): Promise<number> => {
  const query =
    'INSERT INTO gpus (name, vram_size, computer_id, weight, display_order) VALUES (?, ?, ?, ?)';
  const result = await pool.query(query, [
    name,
    vram_size,
    computer_id,
    weight || null,
    display_order,
  ]);
  return Number(result.insertId);
};

// Read all GPUs
// Note, display order will look weird here, but .filter() is used in the client so it should work out
export const getAllGPUs = async (): Promise<GPU[]> => {
  const query = 'SELECT * FROM gpus ORDER BY display_order ASC';
  return await pool.query(query);
};

// Read a GPU by id
export const getGPUById = async (id: number): Promise<GPU | null> => {
  const query = 'SELECT * FROM gpus WHERE id = ? LIMIT 1';
  const rows = await pool.query(query, [id]);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update a GPU
export const updateGPU = async (
  id: number,
  name: string,
  vram_size: number,
  computer_id: number,
  display_order: number,
  weight?: number
): Promise<number> => {
  const query =
    'UPDATE gpus SET name = ?, vram_size = ?, computer_id = ?, weight = ?, display_order = ? WHERE id = ?';
  const result = await pool.query(query, [
    name,
    vram_size,
    computer_id,
    weight || null,
    display_order,
    id,
  ]);
  return Number(result[0].affectedRows);
};

// Delete a GPU
export const deleteGPU = async (id: number): Promise<number> => {
  const query = 'DELETE FROM gpus WHERE id = ?';
  const result = await pool.query(query, [id]);
  return Number(result[0].affectedRows);
};
