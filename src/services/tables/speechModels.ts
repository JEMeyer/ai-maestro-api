import { pool } from '../db';
import { Model } from './types';

// Create a new SpeechModel
export const createSpeechModel = async (
  name: string,
  size: number,
  model_type: 'tts' | 'stt',
  display_order: number
): Promise<number> => {
  const query =
    'INSERT INTO speech_models (name, size, model_type, display_order) VALUES (?, ?, ?, ?)';
  const result = await pool.query(query, [
    name,
    size,
    model_type,
    display_order,
  ]);
  return Number(result.insertId);
};

// Read all SpeechModels
export const getAllSpeechModels = async (): Promise<Model[]> => {
  const query = 'SELECT * FROM speech_models ORDER BY display_order ASC';
  return await pool.query(query);
};

// Read a SpeechModel by name
export const getSpeechModelByName = async (
  name: string
): Promise<Model | null> => {
  const query = 'SELECT * FROM speech_models WHERE name = ? LIMIT 1';
  const rows = await pool.query(query, [name]);

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
};

// Update a SpeechModel
export const updateSpeechModel = async (
  name: string,
  size: number,
  model_type: 'tts' | 'stt',
  display_order: number
): Promise<number> => {
  const query =
    'UPDATE speech_models SET size = ?, model_type = ?, display_order = ? WHERE name = ?';
  const result = await pool.query(query, [
    size,
    model_type,
    display_order,
    name,
  ]);
  return Number(result.affectedRows);
};

// Delete a SpeechModel
export const deleteSpeechModel = async (name: string): Promise<number> => {
  const query = 'DELETE FROM speech_models WHERE name = ?';
  const result = await pool.query(query, [name]);
  return Number(result.affectedRows);
};
