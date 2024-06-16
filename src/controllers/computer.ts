import { Request, Response } from 'express';
import * as ComputerService from '../services/tables/computers';

export const getAllComputers = async (_req: Request, res: Response) => {
  const computers = await ComputerService.getAllComputers();
  res.json(computers);
};

export const getComputerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const computer = await ComputerService.getComputerById(Number(id));
  if (computer != null) res.json(computer);
  else res.sendStatus(404);
};

export const createComputer = async (req: Request, res: Response) => {
  const { name, ipAddr } = req.body;
  const id = await ComputerService.createComputer(name, ipAddr);
  res.json({ id });
};

export const deleteComputer = async (req: Request, res: Response) => {
  const { id } = req.params;
  await ComputerService.deleteComputer(Number(id));
  res.sendStatus(204);
};

export const updateComputer = async (req: Request, res: Response) => {
  const { id, name, ipAddr } = req.body;
  const affectedRows = await ComputerService.updateComputer(
    Number(id),
    name,
    ipAddr
  );
  res.json({ affectedRows });
};
