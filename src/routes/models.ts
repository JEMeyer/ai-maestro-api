import { Router } from 'express';
import * as ModelController from '../controllers/model';

const router = Router();

router.get('/', ModelController.getAllModels);
router.get('/:name', ModelController.getModelByName);
router.post('/', ModelController.createModel);
router.delete('/:name', ModelController.deleteModel);

export default router;
