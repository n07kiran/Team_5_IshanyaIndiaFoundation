import express from 'express';
import {loginStudent, logoutStudent, 
    requestAppointment,
    getStudent
} from '../controllers/StudentController.js'
import validateAppointment from '../middlewares/validateAppointment.js';
import { verifyJWTStudent } from '../middlewares/auth.middleware.js';
import { changePassword } from '../controllers/AuthController.js';

const StudentRouter = express.Router();
StudentRouter.post('/requestAppointment',validateAppointment(), requestAppointment);
StudentRouter.post("/login", loginStudent);
StudentRouter.post("/logout", verifyJWTStudent, logoutStudent);
StudentRouter.get("/", verifyJWTStudent, getStudent);
StudentRouter.post("/changePassword", verifyJWTStudent, changePassword);

export default StudentRouter;