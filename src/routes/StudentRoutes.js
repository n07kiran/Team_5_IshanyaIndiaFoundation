import express from 'express';
import {requestAppointment} from '../controllers/StudentController.js'
import validateAppointment from '../middlewares/validateAppointment.js';

const StudentRouter = express.Router();
StudentRouter.post('/requestAppointment',validateAppointment(), requestAppointment);

export default StudentRouter;
