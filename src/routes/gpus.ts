import { Router } from 'express';
import * as GpuController from '../controllers/gpu';

const router = Router();

router.get('/', GpuController.getAllGpus);
router.post('/', GpuController.createGPU);
router.get('/lockStatuses', GpuController.getGpuLockStatuses);
router.delete('/:id', GpuController.deleteGPU);
router.put('/:id', GpuController.updateGPU);
router.get('/:id', GpuController.getGpuById); // Last so it doesn't 'eat' the /lockStatuses

export default router;
