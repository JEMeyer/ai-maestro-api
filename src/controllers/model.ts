import { Request, Response } from 'express';
import { createLLM, deleteLLM } from '../services/tables/llms';
import { createDiffusor, deleteDiffusor } from '../services/tables/diffusors';
import {
  createSpeechModel,
  deleteSpeechModel,
} from '../services/tables/speechModels';

export const getAllComputers = async (_req: Request, res: Response) => {
  const computers = await ComputerService.getAllComputers();
  res.json(computers);
};

export const getModelByName = async (req: Request, res: Response) => {
  const { id } = req.params;
  const computer = await ComputerService.getComputerById(Number(id));
  if (computer != null) res.json(computer);
  else res.sendStatus(404);
};

export const createModel = async (req: Request, res: Response) => {
  const { name, size, type } = req.body;

  let id;
  switch (type) {
    case 'llm':
      id = await createLLM(name, size);
      break;
    case 'diffusor':
      id = await createDiffusor(name, size);
      break;
    case 'stt':
    case 'tts':
      id = await createSpeechModel(name, size, type);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }

  res.json({ id });
};

export const deleteComputer = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { type } = req.query;

  switch (type) {
    case 'llm':
      await deleteLLM(name);
      break;
    case 'diffusor':
      await deleteDiffusor(name);
      break;
    case 'stt':
    case 'tts':
      await deleteSpeechModel(name);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }
  res.sendStatus(204);
};
