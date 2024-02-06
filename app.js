const path = require("path")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv').config()
const mongoose = require('./db/mongoose')
const fileUpload = require('express-fileupload');
const moment = require('moment-timezone');

const http = require('http');
const https = require('https');
const fs = require('fs');

const express = require('express');
const web = express();
/*const port = 80;
*/
// socketio service
const { app, io, cors, server , httpsserver } = require('./services/socketio')



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

const appdetailsRouter = require('./routes/appdetails')
/*
const settingsRouter = require('./routes/admin/settings')
const AdminRouter = require('./routes/admin/admin')
const AdminUserRouter = require('./routes/admin/users')
const AdminBattleRouter = require('./routes/admin/battles')
*/
const AdminGameRouter = require('./routes/admin/games')

//matka
const MatkaAdminGameRouter = require('./routes/matka/matkaadmin/matkagameadmin')
const MatkaGameRouter = require('./routes/matka/matkagames')



//Star Line matka
const StarLineAdminGameRouter = require('./routes/matka/matkaadmin/starlinegameadmin')
const StarlineGameRouter = require('./routes/matka/starlinegames')



//Gali Diswar matka
const GalidiswarAdminGameRouter = require('./routes/matka/matkaadmin/galidiswargameadmin')
const GalidiswarGameRouter = require('./routes/matka/galidiwargames')



const PORT = process.env.PORT || 80


//routes
app.use(userRouter)
app.use(dashboardRouter)
app.use(battlesRouter)
app.use(walletsRouter)
app.use(gamesRouter)


app.use(appdetailsRouter)

/*
app.use(settingsRouter)
app.use(AdminRouter)
app.use(AdminUserRouter)
app.use(AdminBattleRouter)
*/
app.use(AdminGameRouter)

//matka routes
app.use(MatkaGameRouter)
app.use(MatkaAdminGameRouter)


//Star Line matka routes
app.use(StarLineAdminGameRouter)
app.use(StarlineGameRouter)



//Gali Diswar matka routes
app.use(GalidiswarAdminGameRouter)
app.use(GalidiswarGameRouter)


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// Load ACM certificate and private key
const options = {
  key: fs.readFileSync(__dirname +'/privatekey.key'),
  cert: fs.readFileSync(__dirname +'/certificate.pem'),
};

// Create HTTPS server
const httpsServer = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello, secure world!\n');
});

const httpsPort = 443;

httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server running on https://localhost:${httpsPort}`);
});


// server configurations
server.listen(PORT, () => {
    console.log(`Server is running at port no: ${PORT}`)
})