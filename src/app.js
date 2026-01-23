import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))



app.use(express.json({limit : "16kb"}))
app.use(urlencoded({extended : true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// router import
import authRouter from "./routes/auth.routes.js"
import usersRouter from "./routes/user.routes.js"
import clientRouter from "./routes/client.routes.js"
import communicationRouter from "./routes/communication.routes.js"
import reminderRouter from "./routes/reminder.routes.js"

// route declaretion
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/clients", clientRouter)
app.use("/api/v1/communications", communicationRouter)
app.use("/api/v1/reminders", reminderRouter)

export { app }