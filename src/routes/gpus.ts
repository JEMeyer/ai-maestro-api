import { Router } from 'express';
import * as GpuController from '../controllers/gpu';

const router = Router();

router.get('/', GpuController.getAllGpus);
router.get('/:id', GpuController.getGpuById);
router.post('/', GpuController.createGPU);
router.delete('/:id', GpuController.deleteGPU);

export default router;
