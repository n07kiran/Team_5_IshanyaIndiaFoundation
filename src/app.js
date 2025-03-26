import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import StudentRouter from "./routes/StudentRoutes.js"
import EmployeeRouter from "./routes/EmployeeRouter.js"
import AdminRouter from "./routes/AdminRoutes.js"
import {upload} from "./middlewares/multer.middleware.js"
import {uploadOnCloudinary} from "./utils/cloudinary.js"
import {sendEmail} from "./utils/Emails.js"
import { authRouter } from "./routes/authRouter.js";
import { getMomentOfDay } from "./controllers/EmployeeController.js";

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
 
app.use(express.static("public"))
app.use(cookieParser())

//routes
app.use("/api/v1/student",StudentRouter);
app.use("/api/v1/employee",EmployeeRouter);
app.use("/api/v1/admin",AdminRouter);
app.use("/api/v1/auth",authRouter);

//http://localhost:8000/api/v1/users/register

app.post("/api/v1/upload",upload.single("image"),async (req,res)=>{
    console.log(req.body)
    console.log(req.file)

    const uploadResponse = await uploadOnCloudinary(req.file.path)
    console.log(uploadResponse)

    res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: uploadResponse
    })
})

app.get("/",(req,res)=>{
    res.send("At route / Hello World")
})

app.get("/api/v1/test",(req,res)=>{
    res.send("At route /api/v1/test")
})

app.get("/api/v1/MomentOfDay",getMomentOfDay)

// Test email
app.get("/api/v1/testEmail",async (req,res)=>{
    const mailDetails = {
        toAddresses: ["n07kiran2@gmail.com","nmoger58@gmail.com","chandana24stmn@gmail.com","sapandeep318@gmail.com","syedanidafathima1@gmail.com","chandrasekhar.k5757@gmail.com"],
        subject: "Team 5 - Ishanya",
        text: "We Will Win!!"
    }

    await sendEmail(mailDetails)
    res.status(200).json({
        success: true,
        message: "Email sent successfully"
    })
})
export {app}