const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// root app
app.get("/", (req, res) => {
  res.send("Running Auto-vio Server for heroku");
});

app.listen(port, () => {
  console.log(`Listing AutoVio - ${port}`);
});
