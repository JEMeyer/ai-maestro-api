import { pool } from '../db';

interface GPU {
  id: string;
  name: string;
  vramSize: number;
  computerId: string;
  weight?: number;
}

// Create a new GPU
export const createGPU = async (
  name: string,
  vramSize: number,
  computerId: number,
  weight?: number
): Promise<number> => {
  const query =
    'INSERT INTO gpus (name, vram_size, computer_id, weight) VALUES (?, ?, ?, ?)';
  const result = await pool.query(query, [
    name,
    vramSize,
    computerId,
    weight || null,
  ]);
  return Number(result[0].insertId);
};

// Read all GPUs
export const getAllGPUs = async (): Promise<GPU[]> => {
  const query = 'SELECT * FROM gpus';
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

// Read a GPU by id
export const getGPUById = async (id: number): Promise<GPU | null> => {
  const query = 'SELECT * FROM gpus WHERE id = ?';
  const [rows] = await pool.query(query, [id]);

  // Handle the case when the table is empty or has a single row
  const row = rows.length > 0 ? rows[0] : null;

  return row;
};

// Update a GPU
export const updateGPU = async (
  id: number,
  name: string,
  vramSize: number,
  computerId: number,
  weight?: number
): Promise<number> => {
  const query =
    'UPDATE gpus SET name = ?, vram_size = ?, computer_id = ?, weight = ? WHERE id = ?';
  const result = await pool.query(query, [
    name,
    vramSize,
    computerId,
    weight || null,
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
