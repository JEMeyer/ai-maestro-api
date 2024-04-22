import express from 'express';
import { createClient } from 'redis';
import mariadb from 'mariadb';

const app = express();
const redis = createClient();
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'llm_manager',
  connectionLimit: 5
});

// Connect to Redis and MariaDB
await redis.connect();

// API endpoint to get available models
app.get('/api/models', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const models = await conn.query('SELECT * FROM models');
    res.json(models);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// API endpoint to assign model to GPU
app.post('/api/assign', async (req, res) => {
  const { modelId, serverId, gpuId, port } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE models SET server_id = ?, gpu_id = ?, port = ? WHERE id = ?',
      [serverId, gpuId, port, modelId]
    );

    // Send command to child server to load model
    // ...

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (conn) conn.release();
  }
});

// Start server
app.listen(3000, () => {
  console.log('Master server listening on port 3000');
});
