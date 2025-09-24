import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({limit:"16kb", extended:true}));

app.use(express.static("public"));
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.routes.js";

// routes delcaration
app.use("/api/v1/users",userRouter)

//https:localhost:8000/api/v1/users/resister

export{app}