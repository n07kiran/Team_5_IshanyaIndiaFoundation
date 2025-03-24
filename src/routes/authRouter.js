import { Router } from "express";
import { 
    sendPasswordResetOTP,
    resetPasswordWithOTP,
    changePassword
} from "../controllers/AuthController.js";
// import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// Public routes
authRouter.post("/sendResetPasswordOTP", sendPasswordResetOTP);
authRouter.post("/resetPasswordWithOTP", resetPasswordWithOTP);


export { authRouter };