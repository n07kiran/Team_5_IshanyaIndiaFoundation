import { Router } from "express";
import { registerEmployee, loginEmployee, logoutEmployee, refreshAccessToken } from "../controllers/EmployeeController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        { name: "photo", maxCount: 1 }
    ]),
    registerEmployee
);

router.post("/login", loginEmployee);

// Secured routes
router.post("/logout", verifyJWT, logoutEmployee);
router.post("/refresh-token", refreshAccessToken);

export default router;
