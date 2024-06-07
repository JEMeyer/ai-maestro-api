import { Router } from 'express';
import * as AssignmentController from '../controllers/assignments';

const router = Router();

router.get('/', AssignmentController.getAllAssignments);
router.get('/:id', AssignmentController.getAssignmentById);
router.post('/', AssignmentController.createAssignment);
router.delete('/:id', AssignmentController.deleteAssignment);
router.post('/deployAll', AssignmentController.deployAssignments);
router.put('/:id', AssignmentController.updateAssignment);

export default router;
