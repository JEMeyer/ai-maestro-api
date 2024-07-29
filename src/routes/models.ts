import { Router } from 'express';
import * as ModelController from '../controllers/model';

const router = Router();

router.get('/', ModelController.getAllModels);
router.post('/', ModelController.createModel);
router.get('/:name', ModelController.getModelByName);
router.delete('/:name', ModelController.deleteModel);
router.put('/', ModelController.updateModel);

export default router;
