import { Router } from "express";
import { loginEmployee, logoutEmployee,
    getAppointments,
    getEmployee,
    getEnrollments,
    createJobApplication,
    uploadReport,
    getReportDetails,
 } from "../controllers/EmployeeController.js";
import { verifyJWTEmployee } from "../middlewares/auth.middleware.js";
import { updateAppointment } from "../controllers/admin.controller.js";
import { changePassword } from "../controllers/AuthController.js";

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
EmployeeRouter.post("/job_application",createJobApplication);

// Password 
EmployeeRouter.post("/changePassword", verifyJWTEmployee, changePassword);

//reports
EmployeeRouter.get("/report/:enrollmentId",getReportDetails)
EmployeeRouter.post("/uploadReport",uploadReport);

export default EmployeeRouter;
