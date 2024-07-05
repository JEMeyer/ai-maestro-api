import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import computersRouter from './routes/computers';
import gpusRouter from './routes/gpus';
import modelsRouter from './routes/models';
import cors from 'cors';
import assignmentsRouter from './routes/assignments';
import { setupSSE } from './services/sse';

const app = express();
const server = createServer(app);

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

app.use('/api/computers', computersRouter);
app.use('/api/gpus', gpusRouter);
app.use('/api/models', modelsRouter);
app.use('/api/assignments', assignmentsRouter);
setupSSE(app);

// Start server
server.listen(3000, () => {
  console.log(`Maestro API server listening on port 3000`);
});
