const path = require("path");
const fs = require("fs");
const robotModel = require("../models/robotModel");
const { emitUpdate } = require("../sockets");
const exp = require("constants");

exports.getRobots = async (req, res) => {
  try {
    const robots = await robotModel.getRobots();
    res.json(robots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching robots" });
  }
};

exports.getRobotDetails = async (req, res) => {
  try {
    const robot = await robotModel.getRobotById(req.params.id);
    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }
    res.json(robot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveRobot = async (req, res) => {
  const {
    id,
    leaderName,
    robotName,
    score,
    time,
    homePoints,
    disqualified,
    rounds,
  } = req.body;
  const filePath = path.join(__dirname, "..", "data", "SavedRobots.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error reading file");
    }

    let robotsData = { roundOne: [], roundTwo: [] };
    if (data) {
      robotsData = JSON.parse(data);
    }

    const robot = {
      id,
      leaderName,
      robotName,
      score,
      time,
      homePoints,
      disqualified,
    };

    if (rounds === "roundOne") {
      robotsData.roundOne.push(robot);
    } else if (rounds === "roundTwo") {
      robotsData.roundTwo.push(robot);
    } else {
      return res.status(400).send("Invalid round specified");
    }

    fs.writeFile(filePath, JSON.stringify(robotsData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error writing file");
      }

      res.status(200).send("Robot saved successfully");
    });
  });
};
