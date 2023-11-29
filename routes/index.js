const express = require("express");
const app = express();

const router = require("express").Router();

app.use(express.urlencoded({ extended: true }));

app.use(express.json())

const registration = require("../controllers/registration");

router.get("/", registration.userRegistration);

module.exports = router;