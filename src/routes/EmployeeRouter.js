import { Router } from "express";
import { loginEmployee, logoutEmployee,
    getAppointments
 } from "../controllers/EmployeeController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTEmployee } from "../middlewares/auth.middleware.js";
import { updateAppointment } from "../controllers/admin.controller.js";

const EmployeeRouter = Router();

EmployeeRouter.get("/appointments", getAppointments);
EmployeeRouter.post("/update_appointment", updateAppointment);

// Secured routes
EmployeeRouter.post("/login", loginEmployee);
// Secured routes
EmployeeRouter.post("/logout", verifyJWTEmployee, logoutEmployee);
// EmployeeRouter.post("/refresh-token", refreshAccessToken);

export default EmployeeRouter;
