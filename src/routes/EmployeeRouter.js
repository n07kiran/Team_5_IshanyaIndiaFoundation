import { Router } from "express";
import { loginEmployee, logoutEmployee } from "../controllers/EmployeeController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWTEmployee } from "../middlewares/auth.middleware.js";

const EmployeeRouter = Router();

EmployeeRouter.post("/login", loginEmployee);

// Secured routes
EmployeeRouter.post("/logout", verifyJWTEmployee, logoutEmployee);
// EmployeeRouter.post("/refresh-token", refreshAccessToken);

export default EmployeeRouter;
