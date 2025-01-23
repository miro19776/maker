const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const robotRoutes = require("./routes/robotRouter");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/api", robotRoutes);

module.exports = app;
