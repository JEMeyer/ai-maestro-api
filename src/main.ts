import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import computersRouter from './routes/computers';
import gpusRouter from './routes/gpus';
import modelsRouter from './routes/models';
import assignmentsRouter from './routes/assignments';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use('/api/computers', computersRouter);
app.use('/api/gpus', gpusRouter);
app.use('/api/models', modelsRouter);
app.use('/api/assignments', assignmentsRouter);

// Start server
app.listen(3000, async () => {
  console.log('Maestro API server listening on port 3000');
});
