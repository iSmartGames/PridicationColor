import path from "path"
import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
const dotenv = require('dotenv').config()
import mongoose from './db/mongoose'
import fileUpload from 'express-fileupload'

// socketio service
import { app, io, cors, server } from './services/socketio'

// Express settings
app.use(json());
app.use(urlencoded({
    extended: false
}));
app.use(fileUpload())


import userRouter from './routes/user'
import dashboardRouter from './routes/dashboard'
import battlesRouter from './routes/battles'
import walletsRouter from './routes/wallets'
import gamesRouter from './routes/games'
import settingsRouter from './routes/admin/settings'
import AdminRouter from './routes/admin/admin'
import AdminUserRouter from './routes/admin/users'
import AdminBattleRouter from './routes/admin/battles'
import AdminGameRouter from './routes/admin/games'
const PORT = process.env.PORT || 3000

//routes
app.use(userRouter)
app.use(dashboardRouter)
app.use(battlesRouter)
app.use(walletsRouter)
app.use(gamesRouter)
app.use(settingsRouter)
app.use(AdminRouter)
app.use(AdminUserRouter)
app.use(AdminBattleRouter)
app.use(AdminGameRouter)

// server configurations
server.listen(PORT, () => {
    console.log(`Server is running at port no: ${PORT}`)
})