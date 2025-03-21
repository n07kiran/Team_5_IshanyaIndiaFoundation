import { Router } from "express";
import { registerEmployee, loginEmployee, logoutEmployee } from "../controllers/EmployeeController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const EmployeeRouter = Router();

EmployeeRouter.post(
    "/register",
    registerEmployee
);

EmployeeRouter.post("/login", loginEmployee);

// Secured routes
EmployeeRouter.post("/logout", verifyJWT, logoutEmployee);
// EmployeeRouter.post("/refresh-token", refreshAccessToken);

export default EmployeeRouter;
