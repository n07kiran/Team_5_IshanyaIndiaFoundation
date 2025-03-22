import { Router } from "express";
import { getAppointments, loginAdmin, logoutAdmin, addEmployee, 
    getDepartments, addDepartment, 
    getDesignations, addDesignation, 
    getDiagnoses, addDiagnosis, 
    getPrograms, addProgram,
    scheduleAppointment,updateAppointment
} from "../controllers/admin.controller.js";

import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const AdminRouter = Router();

AdminRouter.post("/login", loginAdmin);

AdminRouter.post("/logout", verifyJWTAdmin, logoutAdmin);

AdminRouter.get("/appointments", getAppointments);
AdminRouter.post("/schedule_appointment", scheduleAppointment);
AdminRouter.post("/update_appointment", updateAppointment);


AdminRouter.post("/add_employee", addEmployee);

AdminRouter.get("/departments", getDepartments);
AdminRouter.post("/add_department", addDepartment);

AdminRouter.get("/designations", getDesignations);
AdminRouter.post("/add_designation", addDesignation);

AdminRouter.get("/diagnosis", getDiagnoses);
AdminRouter.post("/add_diagnosis", addDiagnosis);

AdminRouter.get("/programs", getPrograms);
AdminRouter.post("/add_program", addProgram);



export default AdminRouter;
