import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import StudentRouter from "./routes/StudentRoutes.js"
import EmployeeRouter from "./routes/EmployeeRouter.js"
 

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

//http://localhost:8000/api/v1/users/register

export {app}