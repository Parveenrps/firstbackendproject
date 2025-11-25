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

export {app}; 