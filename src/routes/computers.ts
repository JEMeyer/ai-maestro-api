import { Router } from 'express';
import * as ComputerController from '../controllers/computer';

const router = Router();

router.get('/', ComputerController.getAllComputers);
router.get('/:id', ComputerController.getComputerById);
router.post('/', ComputerController.createComputer);
router.delete('/:id', ComputerController.deleteComputer);
router.put('/:id', ComputerController.updateputer);

export default router;
