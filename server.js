const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const User = require("./models/user");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// POST /api/users
app.post("/api/users", async (req, res) => {
  const user = new User({ username: req.body.username });
  await user.save();
  res.json({ username: user.username, _id: user._id });
});

// GET /api/users
app.get("/api/users", async (req, res) => {
  const users = await User.find({}, "username _id");
  res.json(users);
});

// POST /api/users/:_id/exercises
app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);

  const exerciseDate = date ? new Date(date) : new Date();
  const formattedDate = exerciseDate.toDateString();

  const exercise = { description, duration: parseInt(duration), date: formattedDate };
  user.log.push(exercise);
  await user.save();

  res.json({
    username: user.username,
    description,
    duration: parseInt(duration),
    date: formattedDate,
    _id: user._id
  });
});

// GET /api/users/:_id/logs
app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);

  let log = user.log;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
