import { Router } from "express";
import { getAppointments, loginAdmin, logoutAdmin, addEmployee, 
    getDepartments, addDepartment, 
    getDesignations, addDesignation, 
    getDiagnoses, addDiagnosis, 
    getPrograms, addProgram,
    scheduleAppointment,updateAppointment,
    getAllEmployees,
    getAllStudents,
    addStudent,
    enrollStudent,
    getEnrollments,
    sendSMSAdmin,
    getJobApplications,
    updateJobApplication,
    updateEmployee,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWTAdmin } from "../middlewares/auth.middleware.js";

const AdminRouter = Router();

AdminRouter.post("/login", loginAdmin);

AdminRouter.post("/logout", verifyJWTAdmin, logoutAdmin);

AdminRouter.get("/appointments",verifyJWTAdmin, getAppointments);
AdminRouter.post("/schedule_appointment",verifyJWTAdmin, scheduleAppointment);
AdminRouter.post("/update_appointment",verifyJWTAdmin, updateAppointment);


AdminRouter.post("/add_employee",verifyJWTAdmin, addEmployee);

AdminRouter.get("/departments",verifyJWTAdmin, getDepartments);
AdminRouter.post("/add_department", addDepartment);

AdminRouter.get("/designations",verifyJWTAdmin, getDesignations);
AdminRouter.post("/add_designation",verifyJWTAdmin, addDesignation);

AdminRouter.get("/diagnosis",verifyJWTAdmin, getDiagnoses);
AdminRouter.post("/add_diagnosis",verifyJWTAdmin, addDiagnosis);

AdminRouter.get("/programs",verifyJWTAdmin, getPrograms);
AdminRouter.post("/add_program",verifyJWTAdmin, addProgram);

AdminRouter.get("/allEmployees",verifyJWTAdmin,getAllEmployees);
AdminRouter.get("/allStudents",verifyJWTAdmin,getAllStudents);

// Student Routes
AdminRouter.post("/add_student",verifyJWTAdmin,upload.single("photo"),addStudent);
AdminRouter.post("/enroll_student",verifyJWTAdmin, enrollStudent);
AdminRouter.get("/enrollments",verifyJWTAdmin, getEnrollments);

AdminRouter.post("/send_msg",verifyJWTAdmin,sendSMSAdmin);
AdminRouter.get("/jobApplications",verifyJWTAdmin,getJobApplications);

AdminRouter.post("/updateJobApplication",updateJobApplication);
AdminRouter.post("/updateEmployee",updateEmployee);
export default AdminRouter;
