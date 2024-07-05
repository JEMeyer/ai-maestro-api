import { Router } from 'express';
import * as ComputerController from '../controllers/computer';

const router = Router();

router.get('/', ComputerController.getAllComputers);
router.post('/', ComputerController.createComputer);
router.get('/:id', ComputerController.getComputerById);
router.delete('/:id', ComputerController.deleteComputer);
router.put('/:id', ComputerController.updateComputer);

export default router;
