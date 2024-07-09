import { Request, Response } from 'express';
import * as LlmService from '../services/tables/llms';
import * as DiffusorService from '../services/tables/diffusors';
import * as SpeechModelService from '../services/tables/speechModels';
import { Model } from '../services/tables/types';

export const getAllModels = async (_req: Request, res: Response) => {
  const [llmModels, diffusorModels, speechModels] = await Promise.all([
    LlmService.getAllLLMs(),
    DiffusorService.getAllDiffusors(),
    SpeechModelService.getAllSpeechModels(),
  ]);

  const models = [...llmModels, ...diffusorModels, ...speechModels];

  res.json(models);
};

export const getModelByName = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { model_type } = req.query;

  let model: Model | undefined | null;

  switch (model_type) {
    case 'llm':
      model = await LlmService.getLLMByName(name);
      break;
    case 'diffusor':
      model = await DiffusorService.getDiffusorByName(name);
      break;
    case 'stt':
    case 'tts':
      model = await SpeechModelService.getSpeechModelByName(name);
      break;
    default:
      res.status(400).json({
        error: 'Invalid data/payload - missing or invalid "model_type"',
      });
      return;
  }

  if (model != null) res.json(model);
  else res.sendStatus(404);
};

export const createModel = async (req: Request, res: Response) => {
  const { name, size, model_type } = req.body;

  let id;
  switch (model_type) {
    case 'llm':
      id = await LlmService.createLLM(name, size);
      break;
    case 'diffusor':
      id = await DiffusorService.createDiffusor(name, size);
      break;
    case 'stt':
    case 'tts':
      id = await SpeechModelService.createSpeechModel(name, size, model_type);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }

  res.json({ id });
};

export const deleteModel = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { model_type } = req.query;

  switch (model_type) {
    case 'llm':
      await LlmService.deleteLLM(name);
      break;
    case 'diffusor':
      await DiffusorService.deleteDiffusor(name);
      break;
    case 'stt':
    case 'tts':
      await SpeechModelService.deleteSpeechModel(name);
      break;
    default:
      res.status(400).json({ error: 'Invalid data/payload' });
      return;
  }
  res.sendStatus(204);
};
