import { pool } from '../db';
import { Computer } from './types';

// Create a new computer
export const createComputer = async (
  name: string,
  ipAddr: string
): Promise<number> => {
  const query = 'INSERT INTO computers (name, ip_addr) VALUES (?, ?)';
  const result = await pool.query(query, [name, ipAddr]);
  console.log(result);
  return Number(result.insertId);
};

// Read all computers
export const getAllComputers = async (): Promise<Computer[]> => {
  const query = 'SELECT * FROM computers';
  return await pool.query(query);
};

// Read a computer by id
export const getComputerById = async (id: number): Promise<Computer | null> => {
  const query = 'SELECT * FROM computers WHERE id = ? LIMIT 1';
  const rows = await pool.query(query, [id]);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update a computer
export const updateComputer = async (
  id: number,
  name: string,
  ipAddr: string
): Promise<number> => {
  const query = 'UPDATE computers SET name = ?, ip_addr = ? WHERE id = ?';
  const result = await pool.query(query, [name, ipAddr, id]);
  console.log(result);
  return Number(result.affectedRows);
};

// Delete a computer
export const deleteComputer = async (id: number): Promise<number> => {
  const query = 'DELETE FROM computers WHERE id = ?';
  const result = await pool.query(query, [id]);
  console.log(result);
  return Number(result.affectedRows);
};
