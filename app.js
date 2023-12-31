const path = require("path")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv').config()
const mongoose = require('./db/mongoose')
const fileUpload = require('express-fileupload');
const moment = require('moment-timezone');
// socketio service
const { app, io, cors, server } = require('./services/socketio')

// Express settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(fileUpload())



const userRouter = require('./routes/user')
const dashboardRouter = require('./routes/dashboard')
const battlesRouter = require('./routes/battles')
const walletsRouter = require('./routes/wallets')
const gamesRouter = require('./routes/games')
const settingsRouter = require('./routes/admin/settings')
const AdminRouter = require('./routes/admin/admin')
const AdminUserRouter = require('./routes/admin/users')
const AdminBattleRouter = require('./routes/admin/battles')
const AdminGameRouter = require('./routes/admin/games')

//matka
const MatkaAdminGameRouter = require('./routes/matka/matkaadmin/matkagameadmin')
const MatkaGameRouter = require('./routes/matka/matkagames')



//Star Line matka
const StarLineAdminGameRouter = require('./routes/matka/matkaadmin/starlinegameadmin')
const StarlineGameRouter = require('./routes/matka/starlinegames')




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

//matka routes
app.use(MatkaGameRouter)
app.use(MatkaAdminGameRouter)


//Star Line matka routes
app.use(StarLineAdminGameRouter)
app.use(StarlineGameRouter)




// server configurations
server.listen(PORT, () => {
    console.log(`Server is running at port no: ${PORT}`)
})