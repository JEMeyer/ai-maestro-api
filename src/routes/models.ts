import { Router } from 'express';
import * as ModelController from '../controllers/model';

const router = Router();

router.get('/', ModelController.getAllModels);
router.get('/:id', ModelController.getModelByName);
router.post('/', ModelController.createModel);
router.delete('/:id', ModelController.deleteModel);

export default router;
