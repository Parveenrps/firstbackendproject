import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true      
}))

//for form data
app.use(express.json({limit: "16kb"}));
//for url
app.use(express.urlencoded({extended: true, limit:"16kb"}));
//for public assets
app.use(express.static("public"));
//cookie-parser
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";

//route declaration
//when someone call /users then it give controll to userRouter
app.use("/api/v1/users", userRouter);

//http://localhost:8000/api/v1/users/register similarylly /api/v1/users/login /api/v1 standard practice
export {app}; 