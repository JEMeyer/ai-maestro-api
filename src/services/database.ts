import mariadb from 'mariadb';
import { generateUUID } from '../utilities/uuid';

const pool = mariadb.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  connectionLimit: 5,
});

export interface Computer {
  id: string;
  name: string;
  ipAddr: string;
}

export interface GPU {
  id: string;
  name: string;
  vramSize: number;
  computerId: string;
}

export interface Model {
  id: string;
  name: string;
  containerName: string;
  size: number;
  port: number;
  gpuIds: string[] | null;
}

export async function getConfiguration(): Promise<{
  computers: Computer[];
  gpus: GPU[];
  models: Model[];
}> {
  let conn;
  try {
    conn = await pool.getConnection();

    const computers: Computer[] = await conn.query(
      'SELECT id, name, ip_addr FROM computers'
    );
    const gpus: GPU[] = await conn.query(
      'SELECT id, name, vram_size, computer_id FROM gpus'
    );
    const models: Model[] = await conn.query(`
    SELECT
      m.id,
      m.name,
      m.container_name,
      m.size,
      m.port,
      JSON_ARRAYAGG(mga.gpu_id) AS gpuIds
    FROM
      models m
      LEFT JOIN model_gpu_assignments mga ON m.id = mga.model_id
    GROUP BY
      m.id
  `);

    return { computers, gpus, models };
  } catch (err) {
    console.error('Error loading configuration:', err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// Computers
export const createComputer = async (name: string, ipAddr: string) => {
  const id = generateUUID();
  const query = 'INSERT INTO computers (id, name, ip_addr) VALUES ($1, $2, $3)';
  await pool.query(query, [id, name, ipAddr]);
  return id;
};

export const deleteComputer = async (id: string) => {
  const query = 'DELETE FROM computers WHERE id = $1';
  await pool.query(query, [id]);
};

// GPUs
export const createGPU = async (
  name: string,
  vramSize: number,
  computerId: string
) => {
  const id = generateUUID();
  const query =
    'INSERT INTO gpus (id, name, vram_size, computer_id) VALUES ($1, $2, $3, $4)';
  await pool.query(query, [id, name, vramSize, computerId]);
  return id;
};

export const deleteGPU = async (id: string) => {
  const query = 'DELETE FROM gpus WHERE id = $1';
  await pool.query(query, [id]);
};

// Models
export const createModel = async (
  name: string,
  containerName: string,
  size: number,
  port: number
) => {
  const id = generateUUID();
  const query =
    'INSERT INTO models (id, name, container_name, size, port) VALUES ($1, $2, $3, $4, $5)';
  await pool.query(query, [id, name, containerName, size, port]);
  return id;
};

export const deleteModel = async (id: string) => {
  const query = 'DELETE FROM models WHERE id = $1';
  await pool.query(query, [id]);
};

// Model-GPU Assignments
export const createAssignment = async (modelId: string, gpuId: string) => {
  const query =
    'INSERT INTO model_gpu_assignments (model_id, gpu_id) VALUES ($1, $2)';
  await pool.query(query, [modelId, gpuId]);
};

export const deleteAssignment = async (modelId: string, gpuId: string) => {
  const query =
    'DELETE FROM model_gpu_assignments WHERE model_id = $1 AND gpu_id = $2';
  await pool.query(query, [modelId, gpuId]);
};
