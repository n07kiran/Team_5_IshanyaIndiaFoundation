import { Router } from "express";
import { loginEmployee, logoutEmployee,
    getAppointments,
    getEmployee,
    getEnrollments
 } from "../controllers/EmployeeController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTEmployee } from "../middlewares/auth.middleware.js";
import { updateAppointment } from "../controllers/admin.controller.js";

const EmployeeRouter = Router();

EmployeeRouter.get("/",verifyJWTEmployee, getEmployee);

// Apointmets
EmployeeRouter.get("/appointments",verifyJWTEmployee, getAppointments);
EmployeeRouter.post("/update_appointment",verifyJWTEmployee, updateAppointment);

// Secured routes
EmployeeRouter.post("/login", loginEmployee);
// Secured routes
EmployeeRouter.post("/logout", verifyJWTEmployee, logoutEmployee);
// EmployeeRouter.post("/refresh-token", refreshAccessToken);

// Enrollments
EmployeeRouter.get("/myEnrollments",verifyJWTEmployee, getEnrollments);

export default EmployeeRouter;
