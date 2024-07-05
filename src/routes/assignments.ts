import { Router } from 'express';
import * as AssignmentController from '../controllers/assignments';

const router = Router();

router.get('/', AssignmentController.getAllAssignments);
router.post('/', AssignmentController.createAssignment);
router.post('/deployAll', AssignmentController.deployAssignments);
router.get('/:id', AssignmentController.getAssignmentById);
router.delete('/:id', AssignmentController.deleteAssignment);
router.put('/:id', AssignmentController.updateAssignment);

export default router;
