import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import setupWebSocket from './services/socket';
import computersRouter from './routes/computers';
import gpusRouter from './routes/gpus';
import modelsRouter from './routes/models';
import assignmentsRouter from './routes/assignments';

const app = express();
const server = createServer(app);
setupWebSocket(server); // Setup WebSocket with the server

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/computers', computersRouter);
app.use('/api/gpus', gpusRouter);
app.use('/api/models', modelsRouter);
app.use('/api/assignments', assignmentsRouter);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Maestro API server listening on port ${PORT}`);
});
