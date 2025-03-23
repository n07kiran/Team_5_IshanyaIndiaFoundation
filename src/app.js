import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import StudentRouter from "./routes/StudentRoutes.js"
import EmployeeRouter from "./routes/EmployeeRouter.js"
import AdminRouter from "./routes/AdminRoutes.js"
import {upload} from "./middlewares/multer.middleware.js"
import {uploadOnCloudinary} from "./utils/cloudinary.js"

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

export {app}