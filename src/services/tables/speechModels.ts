import { pool } from '../db';
import { Model } from './types';

// Create a new SpeechModel
export const createSpeechModel = async (
  name: string,
  size: number,
  type: 'tts' | 'stt'
): Promise<number> => {
  const query =
    'INSERT INTO speech_models (name, size, model_type) VALUES (?, ?, ?)';
  const result = await pool.query(query, [name, size, type]);
  return Number(result.affectedRows);
};

// Read all SpeechModels
export const getAllSpeechModels = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM speech_models';
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

// Read a SpeechModel by name
export const getSpeechModelByName = async (
  name: string
): Promise<Model | null> => {
  const query = 'SELECT * FROM speech_models WHERE name = ?';
  const [rows] = await pool.query(query, [name]);

  // Handle the case when the table is empty or has a single row
  const row = rows.length > 0 ? rows[0] : null;

  return row;
};

// Update a SpeechModel
export const updateSpeechModel = async (
  name: string,
  size: number
): Promise<number> => {
  const query = 'UPDATE speech_models SET size = ? WHERE name = ?';
  const result = await pool.query(query, [size, name]);
  return Number(result.affectedRows);
};

// Delete a SpeechModel
export const deleteSpeechModel = async (name: string): Promise<number> => {
  const query = 'DELETE FROM speech_models WHERE name = ?';
  const result = await pool.query(query, [name]);
  return Number(result.affectedRows);
};
